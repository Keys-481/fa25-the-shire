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
            `SELECT dp.plan_id, dp.student_id, dp.course_id, dp.course_status, dp.catalog_year,
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

/**
 * Get a student's degree plan by program requirements,
 * this is to support viewing all program requirements and which courses satisfy them
 * @param {*} studentId - internal student ID
 * @param {*} programId - internal program ID
 * @returns 
 */
async function getDegreePlanByRequirements(studentId, programId) {
    try {
        const query = `
        WITH reqs AS (
            SELECT
                pr.requirement_id, pr.program_id, pr.req_description, pr.required_credits, pr.parent_requirement_id, pr.requirement_type,
                parent.req_description AS parent_description,
                CASE WHEN pr.parent_requirement_id IS NOT NULL THEN parent.req_description
                ELSE pr.req_description END AS requirement_label
            FROM program_requirements pr
            LEFT JOIN program_requirements parent
                ON parent.requirement_id = pr.parent_requirement_id
            WHERE pr.program_id = $2
            )
            SELECT
                r.requirement_id, r.requirement_type, r.req_description, r.parent_requirement_id, r.parent_description, r.required_credits, r.requirement_label,
                c.course_id, c.course_code, c.course_name, c.credits,
                dp.course_status, dp.catalog_year, s.semester_name
            FROM reqs r
            LEFT JOIN requirement_courses rc
                ON rc.requirement_id = r.requirement_id
            LEFT JOIN courses c
                ON c.course_id = rc.course_id
            LEFT JOIN degree_plans dp
                ON dp.course_id = c.course_id
                AND dp.student_id = $1
                AND dp.program_id = r.program_id
            LEFT JOIN semesters s
                ON s.semester_id = dp.semester_id
            ORDER BY r.requirement_label, r.requirement_type, c.course_code`;
        
        const { rows } = await pool.query(query, [studentId, programId]);
        return rows;
    } catch (error) {
        console.error('Error fetching degree plan by requirement:', error);
        throw error;
    }
}

module.exports = {
    getDegreePlanByStudentId,
    getDegreePlanByRequirements,
}

