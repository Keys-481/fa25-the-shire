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
            `SELECT dp.plan_id, dp.course_status,
                    c.course_id, c.course_code, c.course_name, c.credits,
                    s.semester_id, s.semester_name, s.semester_type,
                    s.sem_start_date, s.sem_end_date,
                    p.program_id, p.program_name, p.program_type
            FROM degree_plans dp
            JOIN courses c ON dp.course_id = c.course_id
            JOIN semesters s on dp.semester_id = s.semester_id
            JOIN students st ON dp.student_id = st.student_id
            JOIN programs p ON st.program_id = p.program_id
            WHERE dp.student_id = $1
            ORDER BY s.sem_start_date ASC`,
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

