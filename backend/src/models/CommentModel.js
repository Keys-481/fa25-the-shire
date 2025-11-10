/**
 * File: backend/src/models/CommentModel.js
 * Model for handling comments in the application.
 */

const pool = require('../db');
const NotificationsModel = require('./NotificationsModel');

/**
 * Inserts a new comment into the degree_plan_comments table
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
         VALUES ($1, $2, $3, $4) RETURNING *,
        (SELECT u.first_name FROM users u WHERE u.user_id = $3) AS first_name,
        (SELECT u.last_name FROM users u WHERE u.user_id = $3) AS last_name`,
        [programId, studentId, authorId, comment]
    );

    const newComment = result.rows[0];

    // trigger notifications for relevant users
    await NotificationsModel.createNewCommentNotif({
        author_id: authorId,
        notif_message: comment,
        comment_id: newComment.comment_id,
        program_id: programId,
        student_id: studentId,
    })

    return newComment;
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
            `SELECT c.*,
            u.first_name, u.last_name
            FROM degree_plan_comments c
            JOIN users u ON c.author_id = u.user_id
            WHERE program_id = $1 AND student_id = $2
            ORDER BY created_at`,
            [programId, studentId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
}

/**
 * Deletes a comment by its ID.
 * @param {*} commentId - ID of the comment to delete.
 * @returns The deleted comment object.
 */
async function deleteCommentById(commentId) {
    try {
        const result = await pool.query(
            `DELETE FROM degree_plan_comments WHERE comment_id = $1 RETURNING *`,
            [commentId]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
    }
}

module.exports = {
    createComment,
    getCommentsByProgramAndStudent,
    deleteCommentById
};