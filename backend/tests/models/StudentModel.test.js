/**
 * File: backend/tests/models/StudentModel.test.js
 * Unit tests for StudentModel.js using Jest
 * Tests assume certain values in seed data, if seed data changes, tests may need to be updated
 */

const StudentModel = require('../../src/models/StudentModel');
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
 * Tests for StudentModel
 */
describe('StudentModel', () => {

    // Test for getting student with valid school ID
    // (student with school_student_id '112299690' should exist in seed data)
    test('getStudentBySchoolId returns a student if exists', async () => {
        const schoolId = '112299690'; // should match your seed data
        const student = await StudentModel.getStudentBySchoolId(schoolId);
        expect(student).toBeDefined();
        expect(student.school_student_id).toBe(schoolId);
        expect(student.first_name).toBe('Alice'); // should match seed data
        expect(student.last_name).toBe('Johnson'); // should match seed data
    });

    // Test for getting student with invalid school ID
    test('getStudentBySchoolId returns undefined for non-existent student', async () => {
        const student = await StudentModel.getStudentBySchoolId('invalid_id');
        expect(student).toBeUndefined();
    });

    // Test for getting programs for a valid student ID
    // (student with student_id 1 should exist in seed data and be associated with programs 1 and 2
    test('getProgramsByStudentId returns programs for a valid student', async () => {
        const studentId = 1; // should match your seed data
        const programs = await StudentModel.getProgramsByStudentId(studentId);
        expect(programs).toBeDefined();
        expect(programs.length).toBeGreaterThan(0);
        expect(programs[0]).toHaveProperty('program_id');
        expect(programs[0]).toHaveProperty('program_name');
        expect(programs[0]).toHaveProperty('program_type');

        // Check that the student is enrolled in expected programs (based on seed data)
        const programIds = programs.map(p => p.program_id);
        expect(programIds).toContain(1); // should match seed data
        expect(programIds).toContain(2); // should match seed data
    });
});
