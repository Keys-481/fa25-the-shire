/**
 * File: backend/src/models/CourseModel.js
 * Model for interacting with the courses entity in the database
 */

const pool = require('../db');

/**
 * Get prerequisites for a given course by its internal ID.
 * @param courseId - the internal ID of the course
 * @returns A promise that resolves to an array of prerequisite course objects for the given course ID.
 */
async function getPrerequisitesForCourse(courseId) {
    try {
        const result = await pool.query(
            `SELECT prereq.course_id, prereq.course_code, prereq.course_name, prereq.credits
            FROM course_prerequisites cp
            JOIN courses prereq ON cp.prerequisite_course_id = prereq.course_id
            WHERE cp.course_id = $1`,
            [courseId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching prerequisites:', error);
        throw error;
    }
}

module.exports = {
    getPrerequisitesForCourse,
};