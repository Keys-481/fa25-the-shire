/**
 * File: backend/server.js
 * Basic Express server setup for the backend with database connection verification.
 */

// Load environment variables from .env file
require('dotenv').config({path: '../.env'});

// Import necessary modules
const express = require('express');
const { Client } = require('pg');
const app = express();

// use port from environment or default to 3000
const PORT = process.env.PORT || 3000;

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
};

/**
 * Checks the connection to the PostgreSQL database and returns a status object.
 * This is a read-only check and does not run the setup script.
 */
async function checkDbConnection() {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        // Run a query to  verify connection
        const result = await client.query('SELECT COUNT(*) FROM users;');
        await client.end();
        return {
            status: 'OK',
            message: `Connected successfully. Database contains ${result.rows[0].count} users.`,
        };
    } catch (error) {
        // If connection or query fails
        if (client) await client.end().catch(() => {});
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