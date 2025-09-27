/**
 * File: backend/tests/models/AccessModel.test.js
 * Unit tests for AccessModel.js using Jest
 */

const AccessModel = require('../../src/models/AccessModel');
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
 * Tests for AccessModel
 */
describe('AccessModel', () => {

    // Test for getting user roles (user with ID 1 should be admin in seed data)
    test('getUserRoles returns roles for a user', async () => {
        const roles = await AccessModel.getUserRoles(1);
        expect(roles).toContain('admin');
    });

    // Test for getting user roles for user with multiple roles (user with ID 2 should be advisor and admin in seed data)
    test('getUserRoles returns roles for user with multiple roles', async () => {
        const roles = await AccessModel.getUserRoles(2);
        expect(roles).toContain('advisor');
        expect(roles).toContain('admin');
    });

    // Test for checking advisor-student relationship
    // advisor with user ID 3 should have access to student with ID 2 in seed data
    test('isAdvisorOfStudent returns true if advisor has access', async () => {
        const hasAccess = await AccessModel.isAdvisorOfStudent(3, 2);
        expect(hasAccess).toBe(true);
    });

    // Test for checking advisor-student relationship where no access exists
    // advisor with user ID 3 does not have access to student with ID 1 in seed data
    test('isAdvisorOfStudent returns false if advisor does not have access', async () => {
        const hasAccess = await AccessModel.isAdvisorOfStudent(3, 1);
        expect(hasAccess).toBe(false);
    });
});
