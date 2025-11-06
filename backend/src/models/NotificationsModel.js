/**
 * File: backend/src/models/NotificationsModel.js
 * Model for handling notifications in the application.
 */

const pool = require('../db');

/**
 * Create a new comment notification for relevant users when a new comment is posted (excluding the author).
 * @param {*} comment - The comment object containing details about the new comment.
 */
async function createNewCommentNotif(comment) {
    try {
        await pool.query(
            `WITH recipients AS (
                SELECT s.user_id AS recipient_id, s.student_id
                FROM students s
                UNION
                SELECT a.user_id AS recipient_id, ar.student_id
                FROM advisors a
                JOIN advising_relations ar ON a.advisor_id = ar.advisor_id
            )
            INSERT INTO comment_notifications (recipient_id, triggered_by, title, notif_message, comment_id, program_id, student_id)
            SELECT recipient_id, $1, 'New Degree Plan Comment', $2, $3, $4, student_id
            FROM recipients
            WHERE student_id = $5 AND $1 IS DISTINCT FROM recipient_id`,
            [comment.author_id, comment.notif_message, comment.comment_id, comment.program_id, comment.student_id]
        );
    } catch (error) {
        console.error('Error creating comment notification:', error);
        throw error;
    }
}

/**
 * Mark a notification as read.
 * @param {*} notificationId - The ID of the notification to mark as read.
 */
async function markNotificationAsRead(notificationId) {
    try {
        await pool.query(
            `UPDATE comment_notifications
            SET is_read = TRUE
            WHERE notification_id = $1`,
            [notificationId]
        );
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
}

/**
 * Get all notifications for a specific user.
 * @param {*} userId - The ID of the user to fetch notifications for.
 * @returns An array of notification objects.
 */
async function getNotificationsForUser(userId) {
    try {
        const result = await pool.query(
            `SELECT *
            FROM comment_notifications
            WHERE recipient_id = $1
            ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching notifications for user:', error);
        throw error;
    }
}

module.exports = {
    createNewCommentNotif,
    markNotificationAsRead,
    getNotificationsForUser,
};