/**
 * File: backend/server.js
 * Basic Express server setup for the backend with database connection verification.
 */

// Load environment variables from .env file
require('dotenv').config({path: '../.env'});

// Import necessary modules
const express = require('express');
const pool = require('./src/db');
const app = express();

// use port from environment or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Checks the connection to the PostgreSQL database and returns a status object.
 * This is a read-only check and does not run the setup script.
 */
async function checkDbConnection() {
    try {
        // Run a query to  verify connection
        const result = await pool.query('SELECT COUNT(*) FROM users;');
        return {
            status: 'OK',
            message: `Connected successfully. Database contains ${result.rows[0].count} users.`,
        };
    } catch (error) {
        // If connection or query fails
        return {
            status: 'ERROR',
            message: `Connection failed: ${error.message}. Try running 'npm run db:setup' to initialize the database.`,
        };
    }
}

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to the Shire backend!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
    // check database connection on server startup
    console.log('Checking database connection...');
    checkDbConnection().then(status => {
        console.log(`Database Status: ${status.status} - ${status.message}`);
    });
});