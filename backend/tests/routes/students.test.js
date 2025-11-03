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

    app.use('/students', studentRoutes);
    return app;
}

/**
 * Tests for /students/search route
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

    // Test searching for a student by first name only as an admin user
    test('returns students for valid first name as admin', async () => {
        const app = makeAppWithUser({ user_id: 1 });
        const res = await request(app).get('/students/search').query({ q2: 'Alice' });
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe('112299690');
    });

    // Test searching for a student by last name only as an admin user
    test('returns students for valid last name as admin', async () => {
        const app = makeAppWithUser({ user_id: 1 });
        const res = await request(app).get('/students/search').query({ q2: 'Williams' });
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe('113601927');
    });

    // Test searching for a student by full name only as an admin user
    test('returns students for valid full name as admin', async () => {
        const app = makeAppWithUser({ user_id: 1 });
        const res = await request(app).get('/students/search').query({ q2: 'Alice Johnson' });
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe('112299690');
    });

    // Test searching for a student by partial name and school ID as an admin user
    test('returns student for valid school ID and partial name as admin', async () => {
        const app = makeAppWithUser({ user_id: 1 });
        const res = await request(app).get('/students/search').query({ q1: '112299690', q2: 'Alice' });
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe('112299690');
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
        const res = await request(app).get('/students/112299690/degree-plan?programId=1&viewType=semester');
        expect(res.status).toBe(200);
        expect(res.body.student.school_student_id).toBe('112299690');
        expect(res.body.student.first_name).toBe('Alice'); // should match seed data
        expect(res.body.student.last_name).toBe('Johnson'); // should match seed data
        expect(res.body.programId).toBe('1'); // OPWL MS program ID in seed data
        expect(Array.isArray(res.body.degreePlan)).toBe(true);
        expect(res.body.degreePlan[0]).toHaveProperty('prerequisites');
        const courseCodes = res.body.degreePlan.map(course => course.course_code);
        expect(courseCodes).toContain('OPWL-536'); // should match seed data
    });

    // Test for advisor user accessing their assigned student's degree plan
    test('advisor can view assigned student degree plan', async () => {
        const app = makeAppWithUser({ user_id: 3 }); // advisor with access to student 113601927
        const res = await request(app).get('/students/113601927/degree-plan?programId=2&viewType=semester');
        expect(res.status).toBe(200);
        expect(res.body.student.school_student_id).toBe('113601927');
        expect(res.body.student.first_name).toBe('Bob'); // should match seed data
        expect(res.body.student.last_name).toBe('Williams'); // should match seed data
        expect(res.body.programId).toBe('2'); // OD certificate program ID in seed data
        expect(Array.isArray(res.body.degreePlan)).toBe(true);
        expect(res.body.degreePlan[0]).toHaveProperty('prerequisites');
        const courseCodes = res.body.degreePlan.map(course => course.course_code);
        expect(courseCodes).toContain('OPWL-536'); // should match seed data
    });

    // Test for advisor user accessing a student's degree plan they are not assigned to
    test('returns 403 for advisor not assigned to student', async () => {
        const app = makeAppWithUser({ user_id: 3 }); // advisor without access to student 112299690
        const res = await request(app).get('/students/112299690/degree-plan?programId=1&viewType=semester');
        expect(res.status).toBe(403);
    });

    // Test for user looking up a non-existent student's degree plan
    test('returns 404 for non-existent student', async () => {
        const app = makeAppWithUser({ user_id: 1 }); // admin
        const res = await request(app).get('/students/invalid_id/degree-plan');
        expect(res.status).toBe(404);
    });

    // Test for getting degree plan for requirements view type
    test('returns degree plan grouped by requirements', async () => {
        const app = makeAppWithUser({ user_id: 1 }); // admin
        const res = await request(app).get('/students/112299690/degree-plan?programId=1&viewType=requirements');
        expect(res.status).toBe(200);
        expect(res.body.student.school_student_id).toBe('112299690');
        expect(res.body.student.first_name).toBe('Alice');
        expect(res.body.student.last_name).toBe('Johnson');
        expect(res.body.programId).toBe('1'); // OPWL MS program ID in seed data
        expect(Array.isArray(res.body.degreePlan)).toBe(true);
        expect(res.body.degreePlan[0]).toHaveProperty('prerequisites');
        const courseCodes = res.body.degreePlan.map(course => course.course_code);
        expect(courseCodes).toContain('OPWL-536');
        expect(res.body.degreePlan[0]).toHaveProperty('requirement_id');
        expect(res.body.degreePlan[0]).toHaveProperty('requirement_type');
        expect(res.body.degreePlan[0]).toHaveProperty('req_description');
    });

    // Test for invalid user (no user info) (No login system yet, so changed route to work for frontend requests)
    // need to implement login and authentication for this test to be valid
    // test('returns 401 for no user info', async () => {
    //     const app = makeAppWithUser(null);
    //     const res = await request(app).get('/students/112299690/degree-plan');
    //     expect(res.status).toBe(401);
    // });
});

/**
 * Tests for /students/:schoolId/programs route
 */
describe('GET /students/:schoolId/programs', () => {

    // Test for admin user accessing a student's programs
    test('admin can view any student\'s programs', async () => {
        const app = makeAppWithUser({ user_id: 1 }); // admin
        const res = await request(app).get('/students/112299690/programs');
        expect(res.status).toBe(200);
        expect(res.body.student.school_student_id).toBe('112299690');
        expect(res.body.student.first_name).toBe('Alice'); // should match seed data
        expect(res.body.student.last_name).toBe('Johnson'); // should match seed data
        expect(Array.isArray(res.body.programs)).toBe(true);
        expect(res.body.programs.length).toBeGreaterThan(0);
        const programTypes = res.body.programs.map(program => program.program_type);
        expect(programTypes).toContain('masters'); // should match seed data
        expect(programTypes).toContain('certificate'); // should match seed data
    });

    // Test for advisor user accessing their assigned student's programs
    test('advisor can view assigned student programs', async () => {
        const app = makeAppWithUser({ user_id: 3 }); // advisor with access to student 113601927
        const res = await request(app).get('/students/113601927/programs');
        expect(res.status).toBe(200);
        expect(res.body.student.school_student_id).toBe('113601927');
        expect(res.body.student.first_name).toBe('Bob'); // should match seed data
        expect(res.body.student.last_name).toBe('Williams'); // should match seed data
        expect(Array.isArray(res.body.programs)).toBe(true);
        expect(res.body.programs.length).toBeGreaterThan(0);
        const programTypes = res.body.programs.map(program => program.program_type);
        expect(programTypes).toContain('certificate'); // should match seed data
    });

    // Test for advisor user accessing a student's programs they are not assigned to
    test('returns 403 for advisor not assigned to student', async () => {
        const app = makeAppWithUser({ user_id: 3 }); // advisor without access to student 112299690
        const res = await request(app).get('/students/112299690/programs');
        expect(res.status).toBe(403);
    });

    // Test for user looking up a non-existent student's programs
    test('returns 404 for non-existent student', async () => {
        const app = makeAppWithUser({ user_id: 1 }); // admin
        const res = await request(app).get('/students/invalid_id/programs');
        expect(res.status).toBe(404);
    });
});

/**
 * Tests for PATCH /students/:schoolId/degree-plan/course route
 */
describe('PATCH /students/:schoolId/degree-plan/course', () => {

    // Test for admin user updating a course status in a student's degree plan
    test('admin can update course status in any student\'s degree plan', async () => {
        const app = makeAppWithUser({ user_id: 1 }); // admin

        const res = await request(app)
            .patch('/students/112299690/degree-plan/course')
            .send({
                courseId: 8, // OPWL-529 course ID in seed data
                status: 'Planned',
                semesterId: 8, // Spring 2026 semester ID in seed data
                programId: 1 // OPWL MS program ID in seed data
            });
        expect(res.status).toBe(200);
        expect(res.body.student_id).toBe(1); // internal student ID for school_student_id 112299690 in seed data
        expect(res.body.course_id).toBe(8); // OPWL-529 course ID in seed data
        expect(res.body.course_status).toBe('Planned');
        expect(res.body.semester_id).toBe(8); // Spring 2026 semester ID in seed data
    });

    // Test for advisor user updating a course status in their assigned student's degree plan
    test('advisor can update course status in assigned student\'s degree plan', async () => {
        const app = makeAppWithUser({ user_id: 3 }); // advisor with access to student 113601927

        const res = await request(app)
            .patch('/students/113601927/degree-plan/course')
            .send({
                courseId: 4, // OPWL-518 course ID in seed data
                status: 'In Progress',
                semesterId: 8, // Spring 2026 semester ID in seed data
                programId: 2 // OD certificate program ID in seed data
            });
        expect(res.status).toBe(200);
        expect(res.body.student_id).toBe(2); // internal student ID for school_student_id 113601927 in seed data
        expect(res.body.course_id).toBe(4); // OPWL-518 course ID in seed data
        expect(res.body.course_status).toBe('In Progress');
        expect(res.body.semester_id).toBe(8); // Spring 2026 semester ID in seed data
    });

    // Test for advisor user updating a course status in a student's degree plan they are not assigned to
    test('returns 403 for advisor not assigned to student', async () => {
        const app = makeAppWithUser({ user_id: 3 }); // advisor without access to student 112299690

        const res = await request(app)
            .patch('/students/112299690/degree-plan/course')
            .send({
                courseId: 9, // OPWL-529 course ID in seed data
                status: 'Planned',
                semesterId: 8, // Spring 2026 semester ID in seed data
                programId: 1 // OPWL MS program ID in seed data
            });
        
        expect(res.status).toBe(403);
    });

    // Test for failing to update course status due to unmet prerequisites
    test('returns 400 when prerequisites are not met', async () => {
        const app = makeAppWithUser({ user_id: 1 }); // admin

        // First, reset the course status to 'Unplanned' to ensure the test is valid
        // Make sure prerequisite OPWL-536 is not completed
        await pool.query(`
            UPDATE degree_plans
            SET course_status = 'Unplanned', semester_id = NULL
            WHERE student_id = 1 AND program_id = 1 AND course_id = 1;
        `);

        // set OPWL-529 to unplanned
        await pool.query(`
            UPDATE degree_plans
            SET course_status = 'Unplanned', semester_id = NULL
            WHERE student_id = 1 AND program_id = 1 AND course_id = 8;
        `);

        const res = await request(app)
            .patch('/students/112299690/degree-plan/course')
            .send({
                courseId: 8, // OPWL-529 course ID in seed data (has prerequisite OPWL-536)
                status: 'Planned',
                semesterId: 8, // Spring 2026 semester ID in seed data
                programId: 1 // OPWL MS program ID in seed data
            });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/prerequisite/i);

        // verify that the course status was not updated
        const check = await pool.query(`
            SELECT course_status FROM degree_plans
            WHERE student_id = 1 AND program_id = 1 AND course_id = 8;
        `);

        expect(check.rows[0].course_status).toBe('Unplanned');
    });
});