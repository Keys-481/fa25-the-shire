/**
 * File: backend/tests/models/CourseModel.test.js
 * Unit tests for CourseModel.js using Jest
 * Tests assume certain values in seed data, if seed data changes, tests may need to be updated
 */

const CourseModel = require('../../src/models/CourseModel');
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
 * Tests for CourseModel
 */
describe('CourseModel', () => {

    // Test for getting prerequisites for a valid course ID
    // course with course_id 7 should have prerequisites in seed data (update as needed)
    test('getPrerequisitesForCourse returns prerequisites if exists', async () => {
        const courseId = 7; // should match your seed data
        const prerequisites = await CourseModel.getPrerequisitesForCourse(courseId);
        expect(prerequisites).toBeDefined();
        expect(Array.isArray(prerequisites)).toBe(true);
        expect(prerequisites.length).toBeGreaterThan(0);
    });

    // Test for getting prerequisites for a course with no prerequisites
    // course with course_id 1 should have no prerequisites in seed data (update as needed)
    test('getPrerequisitesForCourse returns empty array if no prerequisites', async () => {
        const courseId = 1; // assuming course_id 1 has no prerequisites in seed data
        const prerequisites = await CourseModel.getPrerequisitesForCourse(courseId);
        expect(prerequisites).toBeDefined();
        expect(Array.isArray(prerequisites)).toBe(true);
        expect(prerequisites.length).toBe(0);
    });

    // Test for getting prerequisites for an invalid course ID
    test('getPrerequisitesForCourse returns empty array for non-existent course', async () => {
        const prerequisites = await CourseModel.getPrerequisitesForCourse(9999); // assuming 9999 does not exist
        expect(prerequisites).toBeDefined();
        expect(Array.isArray(prerequisites)).toBe(true);
        expect(prerequisites.length).toBe(0);
    });
});