/**
 * File: backend/tests/models/StudentModel.test.js
 * Unit tests for StudentModel.js using Jest
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
    });

    // Test for getting student with invalid school ID
    test('getStudentBySchoolId returns undefined for non-existent student', async () => {
        const student = await StudentModel.getStudentBySchoolId('invalid_id');
        expect(student).toBeUndefined();
    });
});
