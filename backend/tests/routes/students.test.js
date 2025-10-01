/**
 * File: backend/tests/routes/students.test.js
 * Integration tests for student routes using Jest and Supertest
 * Test database should be set up and seeded before running these tests
 * Tests assume certain values in seed data, if seed data changes, tests may need to be updated
 */

const request = require('supertest');
const express = require('express');
const { runSchemaAndSeeds } = require('../../db_setup');
const pool = require('../../src/db');
const studentRoutes = require('../../src/routes/students');

// Reset and seed the database before each test
    beforeAll(async () => {
        await runSchemaAndSeeds();
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

    app.use('/students', studentRoutes);
    return app;
}

/**
 * Tests for /students/search route
 * Currently only supports search by school ID (q1)
 */
describe('GET /students/search', () => {

    // Test searching for a student by school ID as an admin user
    // admin user with user ID 1 should exist in seed data as admin
    test('returns student for valid school ID as admin', async () => {
        const app = makeAppWithUser({ user_id: 1 }); 
        const res = await request(app).get('/students/search').query({ q1: '112299690' });
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe('112299690');
        expect(res.body[0].name).toBe('Alice Johnson');
    });

    // Test searching for a student by school ID as an advisor assigned to that student
    // advisor with user ID 3 should have access to student with school_student_id '113601927' in seed data
    test('returns student for valid school ID as assigned advisor', async () => {
        const app = makeAppWithUser({ user_id: 3 });
        const res = await request(app).get('/students/search').query({ q1: '113601927' });
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe('113601927');
    });

    // Test searching for a student by school ID as an advisor not assigned to that student
    // advisor with user ID 3 does not have access to student with school_student_id '112299690' in seed data
    test('returns 404 for valid school ID as unassigned advisor', async () => {
        const app = makeAppWithUser({ user_id: 3 });
        const res = await request(app).get('/students/search').query({ q1: '112299690' });
        expect(res.status).toBe(404);
    });

    // Test searching for a non-existent student by school ID
    test('returns 404 for non-existent school ID', async () => {
        const app = makeAppWithUser({ user_id: 1 }); // admin
        const res = await request(app).get('/students/search').query({ q1: 'invalid_id' });
        expect(res.status).toBe(404);
    });

    // Test searching without providing a school ID
    test('returns 400 for missing school ID', async () => {
        const app = makeAppWithUser({ user_id: 1 }); // admin
        const res = await request(app).get('/students/search').query({});
        expect(res.status).toBe(400);
    });
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

    // Test for invalid user (no user info)
    test('returns 401 for no user info', async () => {  
        const app = makeAppWithUser(null);
        const res = await request(app).get('/students/112299690');
        expect(res.status).toBe(401);
    });
});

/**
 * Tests for /students/:schoolId/degree-plan route
 */
describe('GET /students/:schoolId/degree-plan', () => {

    // Test for admin user accessing a student's degree plan
    test('admin can view any student\'s degree plan', async () => {
        const app = makeAppWithUser({ user_id: 1 }); // admin
        const res = await request(app).get('/students/112299690/degree-plan');
        expect(res.status).toBe(200);
        expect(res.body.student.school_student_id).toBe('112299690');
        expect(res.body.student.first_name).toBe('Alice'); // should match seed data
        expect(res.body.student.last_name).toBe('Johnson'); // should match seed data
        expect(Array.isArray(res.body.degreePlan)).toBe(true);
        expect(res.body.degreePlan[0]).toHaveProperty('prerequisites');
        const courseCodes = res.body.degreePlan.map(course => course.course_code);
        expect(courseCodes).toContain('OPWL-536'); // should match seed data
    });

    // Test for advisor user accessing their assigned student's degree plan
    test('advisor can view assigned student degree plan', async () => {
        const app = makeAppWithUser({ user_id: 3 }); // advisor with access to student 113601927
        const res = await request(app).get('/students/113601927/degree-plan');
        expect(res.status).toBe(200);
        expect(res.body.student.school_student_id).toBe('113601927');
        expect(res.body.student.first_name).toBe('Bob'); // should match seed data
        expect(res.body.student.last_name).toBe('Williams'); // should match seed data
        expect(Array.isArray(res.body.degreePlan)).toBe(true);
        expect(res.body.degreePlan[0]).toHaveProperty('prerequisites');
        const courseCodes = res.body.degreePlan.map(course => course.course_code);
        expect(courseCodes).toContain('OPWL-536'); // should match seed data
    });

    // Test for advisor user accessing a student's degree plan they are not assigned to
    test('returns 403 for advisor not assigned to student', async () => {
        const app = makeAppWithUser({ user_id: 3 }); // advisor without access to student 112299690
        const res = await request(app).get('/students/112299690/degree-plan');
        expect(res.status).toBe(403);
    });

    // Test for user looking up a non-existent student's degree plan
    test('returns 404 for non-existent student', async () => {
        const app = makeAppWithUser({ user_id: 1 }); // admin
        const res = await request(app).get('/students/invalid_id/degree-plan');
        expect(res.status).toBe(404);
    });

    // Test for invalid user (no user info)
    test('returns 401 for no user info', async () => {
        const app = makeAppWithUser(null);
        const res = await request(app).get('/students/112299690/degree-plan');
        expect(res.status).toBe(401);
    });
});


