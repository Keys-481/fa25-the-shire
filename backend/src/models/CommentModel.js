/**
 * File: backend/src/models/CommentModel.js
 * Model for handling comments in the application.
 */

const pool = require('../db');


/**
 * Inserts a new comment into the degree_plan_comments table.
 * @param {*} programId - ID of the program the comment is associated with.
 * @param {*} studentId - ID of the student the comment is associated with.
 * @param {*} authorId - ID of the user creating the comment.
 * @param {*} commentText - The text content of the comment.
 * @returns The newly created comment object.
 */
async function createComment(programId, studentId, authorId, commentText) {
    try {
        const comment = commentText.trim();
        const result = await pool.query(
        `INSERT INTO degree_plan_comments (program_id, student_id, author_id, comment_text)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [programId, studentId, authorId, comment]
    );
    return result.rows[0];
    } catch (error) {
        console.error('Error creating comment:', error);
        throw error;
    }
}

/**
 * Fetches all comments associated with a specific program.
 * @param {*} programId - ID of the program to fetch comments for.
 * @param {*} studentId - ID of the student to fetch comments for.
 * @returns An array of comment objects.
 */
async function getCommentsByProgramAndStudent(programId, studentId) {
    try {
        const result = await pool.query(
            `SELECT * FROM degree_plan_comments WHERE program_id = $1 AND student_id = $2 ORDER BY created_at DESC`,
            [programId, studentId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
}

module.exports = {
    createComment,
    getCommentsByProgramAndStudent,
};