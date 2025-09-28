/**
 * File: backend/src/models/DegreePlanModel.js
 * Model for interacting with the degree_plans table in the database.
 */

const pool = require('../db');

/**
 * Get the degree plan for a specific student.
 * @param studentId - The internal ID of the student (not school ID).
 * @returns A promise that resolves to an array of degree plan entries for the student (courses in the plan).
 */
async function getDegreePlanByStudentId(studentId) {
    try {
        const result = await pool.query(
            `SELECT * FROM degree_plans WHERE student_id = $1`,
            [studentId]
        );
        // return all degree plan entries (courses in the plan) for the student
        return result.rows;
    } catch (error) {
        console.error('Error fetching degree plan:', error);
        throw error;
    }
}

module.exports = {
    getDegreePlanByStudentId,
}

