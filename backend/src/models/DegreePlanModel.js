/**
 * File: backend/src/models/DegreePlanModel.js
 * Model for interacting with the degree_plans table in the database.
 */

const pool = require('../db');

/**
 * Get the degree plan for a specific student by their internal student ID.
 * @param studentId - The internal ID of the student (not school ID).
 * @param programId - The internal ID of a program
 * @returns A promise that resolves to an array of degree plan entries for the student (courses in the plan).
 */
async function getDegreePlanByStudentId(studentId, programId) {
    try {
        const result = await pool.query(
            `SELECT dp.student_id, dp.plan_id, dp.program_id, dp.catalog_year, dp.course_status,
                c.course_id, c.course_code, c.course_name, c.credits,
                s.semester_id, s.semester_name, s.semester_type,
                s.sem_start_date, s.sem_end_date,
                p.program_name, p.program_type
            FROM degree_plans dp
            JOIN courses c ON dp.course_id = c.course_id
            JOIN semesters s on dp.semester_id = s.semester_id
            JOIN programs p ON dp.program_id = p.program_id
            WHERE dp.student_id = $1 AND dp.program_id = $2
            ORDER BY s.sem_start_date ASC, c.course_code ASC`,
            [studentId, programId]
        );
        
        return result.rows;

    } catch (error) {
        console.error('Error fetching degree plan:', error);
        throw error;
    }
}

module.exports = {
    getDegreePlanByStudentId,
}

