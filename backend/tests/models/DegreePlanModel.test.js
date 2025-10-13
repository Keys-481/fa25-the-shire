/**
 * file: backend/tests/models/DegreePlanModel.test.js
 * Unit tests for DegreePlanModel.js using Jest
 * Tests assume certain values in seed data, if seed data changes, tests may need to be updated
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
    // should be associated with program_id 1
    test('getDegreePlanByStudentId returns degree plan if exists', async () => {
        const studentId = 1; // Alice Johnson
        const programId = 1; // OPWL MS
        const degreePlan = await DegreePlanModel.getDegreePlanByStudentId(studentId, programId);

        expect(Array.isArray(degreePlan)).toBe(true);
        expect(degreePlan.length).toBeGreaterThan(0);
        // check that all the rows belong to the correct student
        degreePlan.forEach(plan => {
            expect(plan.student_id).toBe(studentId);
        });

        // check that the first entry has expected fields
        expect(degreePlan[0]).toHaveProperty('student_id');
        expect(degreePlan[0]).toHaveProperty('plan_id');
        expect(degreePlan[0]).toHaveProperty('course_id');
        expect(degreePlan[0]).toHaveProperty('course_code');
        expect(degreePlan[0]).toHaveProperty('course_name');
        expect(degreePlan[0]).toHaveProperty('credits');
        expect(degreePlan[0]).toHaveProperty('semester_id');
        expect(degreePlan[0]).toHaveProperty('semester_name');
        expect(degreePlan[0]).toHaveProperty('semester_type');
        expect(degreePlan[0]).toHaveProperty('sem_start_date');
        expect(degreePlan[0]).toHaveProperty('sem_end_date');
        expect(degreePlan[0]).toHaveProperty('course_status');
        
        // check for specific course code in the degree plan (should match seed data)
        const courseCodes = degreePlan.map(plan => plan.course_code);
        expect(courseCodes).toContain('OPWL-536'); // should match seed data

    });

    // Test for getting student degree plan with invalid student ID
    test('getDegreePlanByStudentId returns empty array for non-existent student', async () => {
        const degreePlan = await DegreePlanModel.getDegreePlanByStudentId(9999); // assuming 9999 does not exist
        expect(degreePlan).toEqual([]); // should return empty array if no degree plan found
    });

    // Test getting degree plan by program requirements
    test('getDegreePlanByRequirement returns degree plan by requirements if exists', async () => {
        const studentId = 1; // Alice Johnson
        const programId = 1; // OPWL MS
        const degreePlan = await DegreePlanModel.getDegreePlanByRequirements(studentId, programId);

        expect(Array.isArray(degreePlan)).toBe(true);
        expect(degreePlan.length).toBeGreaterThan(0);
        // check that the first entry has expected fields
        expect(degreePlan[0]).toHaveProperty('requirement_id');
        expect(degreePlan[0]).toHaveProperty('req_description');
        expect(degreePlan[0]).toHaveProperty('parent_requirement_id');
        expect(degreePlan[0]).toHaveProperty('parent_description');
        expect(degreePlan[0]).toHaveProperty('required_credits');
        expect(degreePlan[0]).toHaveProperty('course_id');
        expect(degreePlan[0]).toHaveProperty('course_code');
        expect(degreePlan[0]).toHaveProperty('course_name');
        expect(degreePlan[0]).toHaveProperty('credits');
        expect(degreePlan[0]).toHaveProperty('course_status');
        expect(degreePlan[0]).toHaveProperty('semester_name');
    });

    // Test for getting total required credits for a program
    test('getTotalProgramRequiredCredits returns correct total credits for a program', async () => {
        const programId = 1; // OPWL MS
        const totalCredits = await DegreePlanModel.getTotalProgramRequiredCredits(programId);
        expect(totalCredits).toBe(24); // should match sum of required_credits in seed data for program_id 1
    });
});
