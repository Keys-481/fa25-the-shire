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
 * @param {*} isRead - Boolean indicating whether the notification is read or unread.
 */
async function markNotificationReadState(notificationId, isRead) {
    try {
        const results = await pool.query(
            `UPDATE comment_notifications
            SET is_read = $1
            WHERE notification_id = $2`,
            [isRead, notificationId]
        );
        return results.rowCount;
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
            `SELECT n.*,
                u_full.first_name || ' ' || u_full.last_name AS triggered_by_name,
                s_user.first_name || ' ' || s_user.last_name AS student_name,
                p.program_name,
                s_full.school_student_id
            FROM comment_notifications n
            LEFT JOIN users u_full ON n.triggered_by = u_full.user_id
            LEFT JOIN students s_full ON n.student_id = s_full.student_id
            LEFT JOIN users s_user ON s_full.user_id = s_user.user_id
            LEFT JOIN programs p ON n.program_id = p.program_id
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
    markNotificationReadState,
    getNotificationsForUser,
};