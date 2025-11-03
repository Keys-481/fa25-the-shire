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
                    s.user_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone_number
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE s.school_student_id = $1`,
            [schoolStudentId]
        );
        return result.rows; // returns the student object or undefined if not found
    } catch (error) {
        console.error('Error fetching student by school ID:', error);
        throw error;
    }
}

/**
 * Get a student by partial name match.
 * @param {*} name - The partial or full name of the student to search for.
 * @returns A promise that resolves to an array of student objects matching the name.
 */
async function getStudentByName(name) {
    try {
        const result = await pool.query(
            `SELECT s.student_id,
                    s.school_student_id,
                    s.user_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone_number
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE (u.first_name || ' ' || u.last_name) ILIKE $1 OR (u.last_name || ' ' || u.first_name) ILIKE $1`,
            [`%${name}%`]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching student by name:', error);
        throw error;
    }
}

/**
 * Get a student by their school ID and partial name match.
 * @param {*} schoolStudentId - The ID of the student to retrieve (not the primary key).
 * @param {*} name - The partial or full name of the student to search for.
 * @returns A promise that resolves to the student object or undefined if not found.
 */
async function getStudentBySchoolIdAndName(schoolStudentId, name) {
    try {
        const result = await pool.query(
            `SELECT s.student_id,
                    s.school_student_id,
                    s.user_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone_number
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE s.school_student_id = $1 AND ((u.first_name || ' ' || u.last_name) ILIKE $2 OR (u.last_name || ' ' || u.first_name) ILIKE $2)`,
            [schoolStudentId, `%${name}%`]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching student by school ID and name:', error);
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
    getStudentByName,
    getStudentBySchoolIdAndName
};
