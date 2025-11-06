/**
 * File: backend/tests/models/NotificationsModel.test.js
 * Tests for NotificationsModel.
 */

const NotificationsModel = require('../../src/models/NotificationsModel');
const CommentModel = require('../../src/models/CommentModel');
const { runSchemaAndSeeds } = require('../../db_setup');
const pool = require('../../src/db');

// Reset and seed the database before each test
beforeAll(async () => {
    await runSchemaAndSeeds();
});

// Close the database connection after all tests
afterAll(async () => {
    await pool.end();
});

/**
 * Tests for NotificationsModel
 */
describe('NotificationsModel', () => {
    
    let newComment;

    beforeAll(async () => {
        // Create a test comment to trigger notifications: MS OPWL, student 1 (Alice Johnson), advisor 2 (Jane Doe)
        newComment = await CommentModel.createComment(1, 1, 2, 'Test comment for notifications');
    });

    test('createNewCommentNotif inserts notifications for relevant users', async () => {
        await NotificationsModel.createNewCommentNotif({
            author_id: newComment.author_id,
            notif_message: newComment.comment_text,
            comment_id: newComment.comment_id,
            program_id: newComment.program_id,
            student_id: newComment.student_id,
        });

        const result = await pool.query(
            `SELECT *
            FROM comment_notifications
            WHERE comment_id = $1`,
            [newComment.comment_id]
        );

        expect(result.rows.length).toBeGreaterThan(0);
        result.rows.forEach(notif => {
            expect(notif.comment_id).toBe(newComment.comment_id);
            expect(notif.title).toBe('New Degree Plan Comment');
            expect(notif.notif_message).toBe(newComment.comment_text);
            expect(notif.program_id).toBe(newComment.program_id);
            expect(notif.student_id).toBe(newComment.student_id);
            expect(notif.triggered_by).toBe(newComment.author_id);
            expect(notif.recipient_id).not.toBe(newComment.author_id); // author should not receive notification
            expect(notif.is_read).toBe(false);
        });
    });

    test('getNotificationsForUser returns all notifications for a user', async () => {
        const userId = 4; // user 4: Alice Johnson (student)
        const notifications = await NotificationsModel.getNotificationsForUser(userId);
        expect(Array.isArray(notifications)).toBe(true);
        notifications.forEach(notif => {
            expect(notif.recipient_id).toBe(userId);
            expect(notif).toHaveProperty('notification_id');
            expect(notif).toHaveProperty('title');
            expect(notif).toHaveProperty('notif_message');
        });
    });

    test('markNotificationAsRead updates the notification to is_read = true', async () => {
        // Get one notification to mark as read
        const result = await pool.query(
            `SELECT notification_id FROM comment_notifications WHERE is_read = false LIMIT 1`
        );
        const notificationId = result.rows[0].notification_id;

        await NotificationsModel.markNotificationAsRead(notificationId);

        const updated = await pool.query(
            `SELECT is_read FROM comment_notifications WHERE notification_id = $1`,
            [notificationId]
        );
        expect(updated.rows[0].is_read).toBe(true);
    });

});