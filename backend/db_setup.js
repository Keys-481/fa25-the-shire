/**
 * Database Setup Script:
 * file: backend/db_setup.js
 * Automates the database setup and seeding process for local development and testing.
 * Connects to PostgreSQL, drops all existing tables, re-creates them, and populates with mock data.
 * Can be called directly or imported for Jest tests
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const envPath = process.env.NODE_ENV === 'dev'
    ? path.resolve(__dirname, '../.env.dev')
    : path.resolve(__dirname, '../.env');

// Load environment variables from .env file (.env should not be committed to version control)
require('dotenv').config({ path: envPath });

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
};

/**
 * runSchemaAndSeeds: connects to the database, executes schema and seed SQL files.
 * @async
 */
async function runSchemaAndSeeds() {
    console.log('--- Setting up database... ---');
    const client = new Client(dbConfig);

    try {
        await client.connect();

        // Read and execute the schema.sql file
        console.log('Executing schema.sql...');
        const schemaSQL = fs.readFileSync(path.resolve(__dirname, '../database/schema.sql'), 'utf8');
        await client.query(schemaSQL);
        console.log('Schema setup complete.');

        // Read and execute the seeds.sql file
        console.log('Executing seeds.sql...');
        const seedsSQL = fs.readFileSync(path.resolve(__dirname, '../database/seeds.sql'), 'utf8');
        await client.query(seedsSQL);
        console.log('Mock data seeded successfully.');

        console.log('--- Database setup complete! ---');
    } catch (err) {
        console.error('Failed to set up database:', err.stack);
        throw err;
    } finally {
        await client.end();
    }
}

// If this script is run directly, execute the setup
if (require.main === module) {
    runSchemaAndSeeds().catch(() => process.exit(1));
}

module.exports = { runSchemaAndSeeds };