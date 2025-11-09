/**
 * File: backend/src/routes/notifications.js
 * Routes for handling notifications.
 */

const express = require('express');
const router = express.Router();
const NotificationsModel = require('../models/NotificationsModel');

/**
 * route GET /notifications
 * Retrieves all notifications for a specific user
 */
router.get('/', async (req, res) => {
    if (!req.user || !req.user.user_id) {
        return res.status(401).json({ message: 'Unauthorized: User ID is required' });
    }

    const currentUserId = req.user.user_id;
    console.log(`Fetching notifications for user ID: ${currentUserId}`);

    try {
        const notifications = await NotificationsModel.getNotificationsForUser(currentUserId);
        console.log(`Fetched notifications for user ID ${currentUserId}:`, notifications);
        return res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * route PUT /notifications/:id/read
 * Marks a specific notification as read
 */
router.put('/:id/read', async (req, res) => {
    if (!req.user || !req.user.user_id) {
        return res.status(401).json({ message: 'Unauthorized: User ID is required' });
    }

    const notificationId = req.params.id;
    const { is_read } = req.body;

    if (typeof is_read !== 'boolean') {
        return res.status(400).json({ message: 'is_read boolean is required in request body' });
    }

    try {
        const result = await NotificationsModel.markNotificationReadState(notificationId, is_read);

        if (!result) {
            return res.status(404).json({ message: 'Notification not found or does not authorized' });
        }
        return res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;