/**
 * File: backend/jest.config.js
 * Jest configuration for the backend tests
 */

export default {
    testEnvironment: 'node',
    testTimeout: 20000,
    maxWorkers: 1,
    setupFiles: ['<rootDir>/jest.env.js'],
}