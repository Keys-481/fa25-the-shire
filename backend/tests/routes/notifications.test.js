/**
 * File: backend/tests/routes/notifications.test.js
 * Tests for notifications routes.
 */

const request = require('supertest');
const express = require('express');
const { runSchemaAndSeeds } = require('../../db_setup');
const pool = require('../../src/db');
const notifications = require('../../src/routes/notifications');

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

    app.use('/notifications', notifications);
    return app;
}

/**
 * Tests for GET /notifications route
 */
describe('GET /notifications', () => {
    // test for successful retrieval of notifications (admin user)
    test('returns 200 and notifications for valid user', async () => {
        const mockUser = { user_id: 1 }; // admin in seed data
        const app = makeAppWithUser(mockUser);

        const response = await request(app)
            .get('/notifications');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.notifications)).toBe(true);
    });

    // test for successful retrieval of notifications (advisor user)
    test('returns 200 and notifications for advisor', async () => {
        const mockUser = { user_id: 2 }; // advisor in seed data
        const app = makeAppWithUser(mockUser);

        const response = await request(app)
            .get('/notifications');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.notifications)).toBe(true);
    });

    // test for successful retrieval of notifications (student user)
    test('returns 200 and notifications for student', async () => {
        const mockUser = { user_id: 4 }; // student Alice Johnson in seed data
        const app = makeAppWithUser(mockUser);

        const response = await request(app)
            .get('/notifications');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.notifications)).toBe(true);
    });

    // test for missing user_id
    test('returns 400 for missing user_id', async () => {
        const app = makeAppWithUser(null);

        const response = await request(app)
            .get('/notifications');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized: User ID is required');
    });
});

/**
 * Tests for PUT /notifications/:id/read route
 */
describe('PUT /notifications/:id/read', () => {
    // test for successful marking of notification as read
    test('returns 200 for successfully marking notification as read', async () => {
        const mockUser = { user_id: 1 }; // admin in seed data
        const app = makeAppWithUser(mockUser);

        const response = await request(app)
            .put('/notifications/1/read')
            .send({ is_read: true });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Notification marked as read');
    });

    // test for missing user_id
    test('returns 401 for missing user_id', async () => {
        const app = makeAppWithUser(null);

        const response = await request(app)
            .put('/notifications/1/read')
            .send({ is_read: true });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized: User ID is required');
    });

    // test for invalid request body
    test('returns 400 for invalid request body', async () => {
        const mockUser = { user_id: 1 }; // admin in seed data
        const app = makeAppWithUser(mockUser);

        const response = await request(app)
            .put('/notifications/1/read')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('is_read boolean is required in request body');
    });
});