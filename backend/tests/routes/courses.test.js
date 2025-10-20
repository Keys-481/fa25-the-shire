/**
 * File: backend/tests/routes/courses.test.js
 * Integration tests for course routes using Jest and Supertest
 * Test database should be set up and seeded before running these tests
 */

const request = require('supertest');
const express = require('express');
const { runSchemaAndSeeds } = require('../../db_setup');
const pool = require('../../src/db');
const courseRoutes = require('../../src/routes/courses');

// Reset and seed the database before all tests
beforeAll(async () => {
    console.log('Resetting and seeding test database...');
    await runSchemaAndSeeds();
});

// Close the database connection after all tests
afterAll(async () => {
    await pool.end();
});

/**
 * Helper function to create an Express app
 */
function makeApp() {
    const app = express();
    app.use(express.json());
    app.use('/courses', courseRoutes);
    return app;
}

/**
 * Tests for /courses/search route
 */
describe('GET /courses/search', () => {
    test('returns enriched course data for valid name and code', async () => {
        const app = makeApp();
        const res = await request(app).get('/courses/search').query({
            q1: 'Organizational Performance and Workplace Learning',
            q2: 'OPWL-536'
        });
        expect(res.status).toBe(200);
        expect(res.body[0].code).toBe('OPWL-536');
        expect(res.body[0].name).toBe('Organizational Performance and Workplace Learning');
        expect(typeof res.body[0].offerings).toBe('string');
        expect(res.body[0].offerings).toContain('FA');
        expect(res.body[0].offerings).toContain('SP');
        expect(res.body[0].offerings).toContain('SU');
        expect(Array.isArray(res.body[0].prerequisites)).toBe(true);
    });

    test('returns 400 for missing parameters', async () => {
        const app = makeApp();
        const res = await request(app).get('/courses/search');
        expect(res.status).toBe(400);
    });

    test('returns 404 for no matching courses', async () => {
        const app = makeApp();
        const res = await request(app).get('/courses/search').query({ q1: 'Nonexistent' });
        expect(res.status).toBe(404);
    });
});

/**
 * Tests for POST /courses
 */
describe('POST /courses', () => {
    test('creates a new course with offerings and prerequisites', async () => {
        const app = makeApp();
        const res = await request(app).post('/courses').send({
            name: 'Test Course',
            code: 'TEST101',
            credits: 3,
            prerequisites: 'OPWL-536',
            offerings: 'FA, SP'
        });

        expect(res.status).toBe(201);
        expect(res.body.name).toBe('Test Course');
        expect(res.body.code).toBe('TEST101');
        expect(res.body.credits).toBe(3);
    });
});

/**
 * Tests for PUT /courses/:id
 */
describe('PUT /courses/:id', () => {
    test('updates an existing course', async () => {
        const app = makeApp();

        // Create a course to update
        const createRes = await request(app).post('/courses').send({
            name: 'Update Me',
            code: 'UPD101',
            credits: 2,
            prerequisites: '',
            offerings: 'FA'
        });

        const courseId = createRes.body.id;

        const updateRes = await request(app).put(`/courses/${courseId}`).send({
            name: 'Updated Course',
            code: 'UPD101',
            credits: 4,
            prerequisites: '',
            offerings: 'SP'
        });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.name).toBe('Updated Course');
        expect(updateRes.body.credits).toBe(4);
    });

    test('returns 400 for invalid course ID', async () => {
        const app = makeApp();
        const res = await request(app).put('/courses/abc').send({});
        expect(res.status).toBe(400);
    });
});

/**
 * Tests for DELETE /courses/:id
 */
describe('DELETE /courses/:id', () => {
    test('deletes an existing course', async () => {
        const app = makeApp();

        // Create a course to delete
        const createRes = await request(app).post('/courses').send({
            name: 'Delete Me',
            code: 'DEL101',
            credits: 1,
            prerequisites: '',
            offerings: ''
        });

        const courseId = createRes.body.id;

        const deleteRes = await request(app).delete(`/courses/${courseId}`);
        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.message).toBe('Course deleted successfully');
    });
});

/**
 * Tests for GET /courses/enrollments
 * 
 */

describe('GET /courses/enrollments', () => {
    test('returns enrollment data for a valid course code', async () => {
        const app = makeApp();
        const res = await request(app).get('/courses/enrollments').query({ courseCode: 'OPWL-536' });
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.enrollments)).toBe(true);
    });
    test('returns 400 for missing courseCode parameter', async () => {
        const app = makeApp();
        const res = await request(app).get('/courses/enrollments');
        expect(res.status).toBe(400);
    });
});

/**
 * Tests for GET /courses/enrollments
 * Test a course has known enrollments
 */

describe('GET /courses/enrollments', () => {
    test('returns enrollment data for a valid course code', async () => {
        const app = makeApp();
        const res = await request(app).get('/courses/enrollments').query({ courseCode: 'OPWL-507' });
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.enrollments)).toBe(true);
    });
    test('returns 400 for missing courseCode parameter', async () => {
        const app = makeApp();
        const res = await request(app).get('/courses/enrollments');
        expect(res.status).toBe(400);
    });
});