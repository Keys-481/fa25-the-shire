/**
 * 
 * file: backend/tests/routes/graduation.test.js
 * Integration tests for graduation routes using Jest and Supertest
 * Tests assume certain values in seed data, if seed data changes, tests may need to be updated
 */

const request = require('supertest');
const express = require('express');
const { runSchemaAndSeeds } = require('../../db_setup');
const pool = require('../../src/db');
const graduationRoutes = require('../../src/routes/graduation');

let client;

// Reset and seed the database before each test
beforeAll(async () => {
    await runSchemaAndSeeds();
});

// Start a transaction before each test
beforeEach(async () => {
    client = await pool.connect();
    await client.query('BEGIN;');
});

// Discard any changes after each test
afterEach(async () => {
    await client.query('ROLLBACK;');
    client.release();
});

// Close the database connection after all tests
afterAll(async () => {
    await pool.end();
});

/**
 * Helper function to create an Express app with mocked authentication
 * @param mockUser - The user object to set in req.user
 * @returns Express app with mocked authentication middleware
 */
function makeAppWithUser(mockUser) {
    const app = express();
    app.use(express.json());

    // mock authentication middleware
    app.use((req, res, next) => {
        req.user = mockUser;
        next();
    });

    app.use('/api/graduation', graduationRoutes);
    return app;
}

/**
 * Test get /graduation route
 */
describe('GET /api/graduation', () => {
    test('returns all applications for admin user', async () => {
        const mockAdminUser = { user_id: 1 };
        const app = makeAppWithUser(mockAdminUser);
        const res = await request(app).get('/api/graduation');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('students');
        expect(Array.isArray(res.body.students)).toBe(true);
        expect(res.body.students.length).toBeGreaterThan(0); // assuming seed data has applications
    });
    test('returns only advisor students for advisor user', async () => {
        const mockAdvisorUser = { user_id: 3 };
        const app = makeAppWithUser(mockAdvisorUser);
        const res = await request(app).get('/api/graduation');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('students');
        expect(Array.isArray(res.body.students)).toBe(true);
        // further checks can be added based on seed data
    });
    test('returns only own application for student user', async () => {
        const mockStudentUser = { user_id: 5 };
        const app = makeAppWithUser(mockStudentUser);
        const res = await request(app).get('/api/graduation');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('students');
        expect(Array.isArray(res.body.students)).toBe(true);
        // further checks can be added based on seed data
    });
});

/**
 * Test get /graduation-report route
 */
describe('GET /api/graduation/graduation-report', () => {
    test('returns filtered applications for accounting user', async () => {
        const mockAccountingUser = { user_id: 14 };
        const app = makeAppWithUser(mockAccountingUser);
        const res = await request(app).get('/api/graduation/graduation-report?status=Applied,Approved');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('students');
        expect(Array.isArray(res.body.students)).toBe(true);
        // further checks can be added based on seed data
    });
});

/**
 * Test put /graduation/:id/status route
 */
describe('PUT /api/graduation/:id/status', () => {
    test('updates application status for admin user', async () => {
        const mockAdminUser = { user_id: 1 };
        const app = makeAppWithUser(mockAdminUser);
        const newStatus = 'Approved';
        const applicationId = 1; // assuming application with ID 1 exists in seed data
        const res = await request(app)
            .put(`/api/graduation/${applicationId}/status`)
            .send({ status: newStatus });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('application_id', applicationId);
        expect(res.body).toHaveProperty('status', newStatus);
    });
});
