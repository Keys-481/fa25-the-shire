/**
 * File: CourseModel.js
 * This file defines functions to interact with the 'courses' entity in the database.
 * It includes functions to retrieve course details and search courses.
 */

const pool = require('../db');

/**
 * Search for courses by name, code, or both.
 * @param {Object} params - Search parameters.
 * @param {string} params.name - Partial or full course name.
 * @param {string} params.code - Partial or full course code.
 * @returns {Promise<Array>} - Array of matching course objects.
 */
async function searchCourses({ name, code }) {
    try {
        let query = `SELECT course_id, course_code, course_name, credits FROM courses WHERE 1=1`;
        const values = [];

        if (name) {
            query += ` AND LOWER(course_name) LIKE LOWER($${values.length + 1})`;
            values.push(`%${name}%`);
        }

        if (code) {
            query += ` AND LOWER(course_code) LIKE LOWER($${values.length + 1})`;
            values.push(`%${code}%`);
        }

        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error searching courses:', error);
        throw error;
    }
}

module.exports = {
    searchCourses
};
