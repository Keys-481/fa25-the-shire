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
                    u.public_id,
                    u.user_id,
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

/**
 * Get all programs associated with a student by their school_student_id.
 * @param {*} schoolStudentId - The school-level ID of the student.
 * @returns A promise that resolves to an array of program objects.
 */
async function getProgramsBySchoolStudentId(schoolStudentId) {
    try {
        const result = await pool.query(
            `SELECT p.program_id, p.program_name, p.program_type
             FROM student_programs sp
             JOIN students s ON sp.student_id = s.student_id
             JOIN programs p ON sp.program_id = p.program_id
             WHERE s.school_student_id = $1`,
            [schoolStudentId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching programs by school_student_id:', error);
        throw error;
    }
}

/**
 * Get all students matching a phone number (partial or full).
 * @param {*} phoneNumber - Student's phone number (partial or full)
 * @returns A promise that resolves to an array of student objects matching the phone number.
 */
async function getStudentByPhoneNumber(phoneNumber) {
    try {
        const phoneDigits = (phoneNumber || '').replace(/\D/g, '');

        if (!phoneDigits) {
            return [];
        }

        const result = await pool.query(
            `SELECT
                s.student_id,
                s.school_student_id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone_number
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE regexp_replace(u.phone_number, '\\D', '', 'g')
            LIKE $1 || '%'`,
            [phoneDigits]
        );

        return result.rows;
    } catch (error) {
        console.error('Error fetching student by phone number: ', error);
        throw error;
    }
}/**
 * Get Students who have applied for graduation.
 * @returns A promise that resolves to an array of student objects.
 */
async function getStudentsAppliedForGraduation() {
    try {
        const query = `
            SELECT
                g.application_id,
                g.student_id,
                s.school_student_id,
                u.first_name,
                u.last_name,
                u.email,
                p.program_name,
                g.status,
                g.status_updated_at
            FROM graduation_applications g
            LEFT JOIN students s ON g.student_id = s.student_id
            LEFT JOIN users u ON s.user_id = u.user_id
            LEFT JOIN programs p ON g.program_id = p.program_id
            WHERE COALESCE(LOWER(g.status), '') IN ('applied', 'approved')
            ORDER BY g.status_updated_at DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    } catch (error) {
        console.error('Error fetching students applied for graduation:', error);
        throw error;
    }
}


module.exports = {
    getStudentBySchoolId,
    getProgramsByStudentId,
    getStudentByName,
    getStudentBySchoolIdAndName,
    getProgramsBySchoolStudentId,
    getStudentByPhoneNumber
};
