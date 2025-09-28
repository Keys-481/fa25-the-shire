/**
 * File: StudentModel.js
 * This file defines functions to interact with the 'students' entity in the database.
 * It includes functions to create, read, update, and delete student records.
 */

const pool = require('../db');

/**
 * Get a student by their ID.
 * @param schoolStudentId - The ID of the student to retrieve (not the primary key).
 * @returns A promise that resolves to the student object.
 */
async function getStudentBySchoolId(schoolStudentId) {
    try {
        const result = await pool.query(
            'SELECT * FROM students WHERE school_student_id = $1',
            [schoolStudentId]
        );
        return result.rows[0]; // returns the student object or undefined if not found
    } catch (error) {
        console.error('Error fetching student:', error);
        throw error;
    }
}

module.exports = {
    getStudentBySchoolId
};
