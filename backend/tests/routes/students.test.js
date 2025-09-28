/**
 * File: backend/tests/routes/students.test.js
 * Integration tests for student routes using Jest and Supertest
 * Test database should be set up and seeded before running these tests
 */

const request = require('supertest');
const express = require('express');
const { runSchemaAndSeeds } = require('../../db_setup');
const pool = require('../../src/db');
const studentRoutes = require('../../src/routes/students');

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

    app.use('/students', studentRoutes);
    return app;
}

// Reset and seed the database before each test
beforeAll(async () => {
    await runSchemaAndSeeds();
});

// Close the database connection after all tests
afterAll(async () => {
    await pool.end();
});

/**
 * Tests for /students/:schoolId route
 */
describe('GET /students/:schoolId', () => {
    // Test for admin user accessing a student user
    // admin user with user ID 1 should exist in seed data
    test('returns student for admin', async () => {
        const app = makeAppWithUser({ user_id: 1 });
        const res = await request(app).get('/students/112299690');
        expect(res.status).toBe(200);
        expect(res.body.school_student_id).toBe('112299690');
    });

    // Test for advisor user accessing their assigned student
    // advisor with user ID 3 should have access to student with school_student_id '113601927' in seed data
    test('returns student for assigned advisor', async () => {
        const app = makeAppWithUser({ user_id: 3 });
        const res = await request(app).get('/students/113601927');
        expect(res.status).toBe(200);
    });

    // Test for advisor user accessing a student they are not assigned to
    // advisor with user ID 3 does not have access to student with school_student_id '112299690' in seed data
    test('returns 404 for advisor not assigned to student', async () => {
        const app = makeAppWithUser({ user_id: 3 }); // advisor without access
        const res = await request(app).get('/students/112299690');
        expect(res.status).toBe(404);
    });

    // Test for user looking up a non-existent student
    test('returns 404 for non-existent student', async () => {
        const app = makeAppWithUser({ user_id: 1 }); // admin
        const res = await request(app).get('/students/invalid_id');
        expect(res.status).toBe(404);
    });
});


