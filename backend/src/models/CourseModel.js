/**
 * File: backend/src/models/CourseModel.js
 * Model for interacting with the courses entity in the database
 */

const pool = require('../db');

/**
 * Find courses by partial name match using case-insensitive search.
 * @param {string} name - The partial or full name of the course to search for.
 * @returns {Promise<Array>} A promise that resolves to an array of course objects matching the name.
 */
async function findByName(name) {
  return pool.query(
    'SELECT course_id, course_name FROM courses WHERE course_name ILIKE $1',
    [`%${name}%`]
  ).then(res => res.rows)
}

/**
 * Find courses by partial ID match using case-insensitive search.
 * @param {string} id - The partial or full course ID to search for.
 * @returns {Promise<Array>} A promise that resolves to an array of course objects matching the ID.
 */
async function findById(id) {
  return pool.query(
    'SELECT course_id, course_name FROM courses WHERE course_id ILIKE $1',
    [`%${id}%`]
  ).then(res => res.rows)
}

/**
 * Find courses by both partial name and ID match using case-insensitive search.
 * @param {string} name - The partial or full name of the course.
 * @param {string} id - The partial or full course ID.
 * @returns {Promise<Array>} A promise that resolves to an array of course objects matching both criteria.
 */
async function findByNameAndId(name, id) {
  return pool.query(
    'SELECT course_id, course_name FROM courses WHERE course_name ILIKE $1 AND course_id ILIKE $2',
    [`%${name}%`, `%${id}%`]
  ).then(res => res.rows)
}

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

/**
 * Get the semesters in which a course is offered by its internal ID.
 * @param courseId - the internal ID of the course
 * @returns A promise that resolves to a string listing the semesters the course is offered.
 */
async function getCourseOfferings(courseId) {
  try {
    const result = await pool.query(
        `SELECT semester_type
        FROM course_offerings
        WHERE course_id = $1`,
        [courseId]
    );
    const offerings = result.rows.map(row => row.semester_type).join(', ');
    return offerings;
  } catch (error) {
    console.error('Error fetching course offerings:', error);
    throw error;
  }
}

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
  findByName,
  findById,
  findByNameAndId,
  getPrerequisitesForCourse,
  getCourseOfferings,
  searchCourses
};