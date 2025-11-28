/** 
 * file: backend/tests/models/GraduationModel.test.js
 * Unit tests for GraduationModel.js using Jest
 * Tests assume certain values in seed data, if seed data changes, tests may need to be updated
 */

const GraduationModel = require('../../src/models/GraduationModel');
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
 * Tests for GraduationModel
 */
describe('GraduationModel', () => {
    // Test for getting all graduation applications
    test('getApplications returns all applications when no status filter is provided', async () => {
        const applications = await GraduationModel.getApplications(null);
        expect(Array.isArray(applications)).toBe(true);
        expect(applications.length).toBeGreaterThan(0); // assuming seed data has applications
    });

    // Test for getting graduation applications with specific status
    test('getApplications returns applications filtered by status', async () => {
        const status = 'Applied';
        const applications = await GraduationModel.getApplications(status);
        expect(Array.isArray(applications)).toBe(true);
        applications.forEach(app => {
            expect(app.status).toBe(status);
        });
    });

    // Test for getting a graduation application by ID
    test('getApplicationById returns the correct application', async () => {
        const applicationId = 1; // assuming application with ID 1 exists in seed data
        const application = await GraduationModel.getApplicationById(applicationId);
        expect(application).not.toBeNull();
        expect(application.application_id).toBe(applicationId);
    }
    );
    // Test for creating a new graduation application
    test('createApplication creates and returns a new application', async () => {
        const studentId = 2; // assuming student with ID 2 exists in seed data  
        const programId = 1; // assuming program with ID 1 exists in seed data
        const newApp = await GraduationModel.createApplication(studentId, programId);
        expect(newApp).toHaveProperty('application_id');
        expect(newApp.student_id).toBe(studentId);
        expect(newApp.program_id).toBe(programId);
        expect(newApp.status).toBe('Not Applied');
    });

    // Test for updating graduation application status
    test('updateApplicationStatus updates the status of an application', async () => {
        const applicationId = 1; // assuming application with ID 1 exists in seed data
        const newStatus = 'Approved';
        const updatedApp = await GraduationModel.updateApplicationStatus(applicationId, newStatus);
        expect(updatedApp.application_id).toBe(applicationId);
        expect(updatedApp.status).toBe(newStatus);
    });
});
