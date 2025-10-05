/**
 * File: StudentModel.js
 * This file defines functions to interact with the 'students' entity in the database.
 * It includes functions to create, read, update, and delete student records.
 * It also includes functions to retrieve programs associated with a student.
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
            `SELECT s.student_id,
                    s.school_student_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone_number
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE s.school_student_id = $1`,
            [schoolStudentId]
        );
        return result.rows[0]; // returns the student object or undefined if not found
    } catch (error) {
        console.error('Error fetching student:', error);
        throw error;
    }
}

/**
 * Get all programs associated with a student by their ID.
 * @param {*} studentId - The internal ID of the student whose programs to retrieve.
 * @returns A promise that resolves to an array of program objects.
 */
async function getProgramsByStudentId(studentId) {
    try {
        const result = await pool.query(
            `SELECT p.program_id, p.program_name, p.program_type
            FROM student_programs sp
            JOIN programs p ON sp.program_id = p.program_id
            WHERE sp.student_id = $1`,
            [studentId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching student programs:', error);
        throw error;
    }
}

module.exports = {
    getStudentBySchoolId,
    getProgramsByStudentId,
};
