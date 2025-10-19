const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel');

/**
 * GET /search
 * Searches users by name and/or role.
 *
 * @query {string} q1 - Role query (optional).
 * @query {string} q2 - Name query (optional).
 * @returns {Array<Object>} Array of formatted user objects with ID and name including roles.
 */
router.get('/search', async (req, res) => {
    const roleQuery = req.query.q1 || '';
    const nameQuery = req.query.q2 || '';

    try {
        const users = await UserModel.searchUsers(nameQuery, roleQuery);

        const formatted = users.map(user => {
            const roles = Array.isArray(user.roles) && user.roles.length > 0
                ? user.roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')
                : 'None';

            return {
                id: user.id,
                name: `${user.name} – ${roles}`
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /roles
 * Retrieves all available roles.
 *
 * @returns {Array<string>} Array of role names.
 */
router.get('/roles', async (req, res) => {
    try {
        const roles = await UserModel.getAllRoles();
        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /all
 * Retrieves all users with their roles.
 *
 * @returns {Array<Object>} Array of user objects with ID, name, and roles.
 */
router.get('/all', async (req, res) => {
    try {
        const users = await UserModel.searchUsers('', ''); // empty filters = all users
        const formatted = users.map(user => ({
            id: user.id,
            name: `${user.name}`,
            roles: user.roles.map(r => r.charAt(0).toUpperCase() + r.slice(1))
        }));
        res.json(formatted);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /:id/roles
 * Retrieves roles assigned to a specific user.
 *
 * @param {string} id - User ID.
 * @returns {Array<string>} Array of role names.
 */
router.get('/:id/roles', async (req, res) => {
    const userId = req.params.id;

    try {
        const roles = await UserModel.getUserRoles(userId);
        res.json(roles);
    } catch (error) {
        console.error(`Error fetching roles for user ${userId}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
