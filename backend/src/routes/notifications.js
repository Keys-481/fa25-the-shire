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

module.exports = router;