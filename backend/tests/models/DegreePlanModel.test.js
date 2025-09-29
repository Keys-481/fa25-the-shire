/**
 * file: backend/tests/models/DegreePlanModel.test.js
 * Unit tests for DegreePlanModel.js using Jest
 */

const DegreePlanModel = require('../../src/models/DegreePlanModel');
const { runSchemaAndSeeds } = require('../../db_setup');
const pool = require('../../src/db');

// Reset and seed the database before each test
beforeAll(async () => {
    await runSchemaAndSeeds();
});

// Close the database connection after all tests
afterAll(async () => {
    await pool.end();
});

/**
 * Tests for DegreePlanModel
 */
describe('DegreePlanModel', () => {

    // Test for getting student degree plan with valid school ID
    // student with student_id 1 should exist in seed data with entries in degree plan table
    test('getDegreePlanByStudentId returns degree plan if exists', async () => {
        const studentId = 1;
        const degreePlan = await DegreePlanModel.getDegreePlanByStudentId(studentId);

        expect(Array.isArray(degreePlan)).toBe(true);
        expect(degreePlan.length).toBeGreaterThan(0);
        // check that all the rows belong to the correct student
        degreePlan.forEach(plan => {
            expect(plan.student_id).toBe(studentId);
        });
    });

    // Test for getting student degree plan with invalid student ID
    test('getDegreePlanByStudentId returns empty array for non-existent student', async () => {
        const degreePlan = await DegreePlanModel.getDegreePlanByStudentId(9999); // assuming 9999 does not exist
        expect(degreePlan).toEqual([]); // should return empty array if no degree plan found
    });
});
