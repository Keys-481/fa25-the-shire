const pool = require('../db');
const bcrypt = require('bcrypt');

/**
 * Searches users by name and/or role.
 *
 * @async
 * @function searchUsers
 * @param {string|null} nameQuery - Partial or full name to search (first or last name). Case-insensitive.
 * @param {string|null} roleQuery - Partial or full role name to filter users by. Case-insensitive.
 * @returns {Promise<Array<Object>>} Array of user objects with `id`, `name`, and `roles` fields.
 */
async function searchUsers(nameQuery, roleQuery) {
    const nameParam = nameQuery && nameQuery.trim() !== '' ? `%${nameQuery}%` : null;
    const roleParam = roleQuery && roleQuery.trim() !== '' ? `%${roleQuery.toLowerCase()}%` : null;

    // Step 1: Get matching user IDs
    const userIdResult = await pool.query(
        `
    SELECT DISTINCT u.user_id
    FROM users u
    LEFT JOIN user_roles ur ON u.user_id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.role_id
    WHERE ($1::TEXT IS NULL OR u.first_name ILIKE $1 OR u.last_name ILIKE $1)
      AND ($2::TEXT IS NULL OR r.role_name::TEXT ILIKE $2)
    `,
        [nameParam, roleParam]
    );

    const userIds = userIdResult.rows.map(row => row.user_id);
    if (userIds.length === 0) return [];

    // Step 2: Get full user info and all roles
    const result = await pool.query(
        `
    SELECT 
      u.user_id AS id,
      CONCAT(u.first_name, ' ', u.last_name) AS name,
      COALESCE(ARRAY_AGG(DISTINCT r.role_name::TEXT), ARRAY[]::TEXT[]) AS roles
    FROM users u
    LEFT JOIN user_roles ur ON u.user_id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.role_id
    WHERE u.user_id = ANY($1)
    GROUP BY u.user_id, u.first_name, u.last_name
    `,
        [userIds]
    );

    return result.rows;
}

/**
 * Retrieves all available role names from the database.
 *
 * @async
 * @function getAllRoles
 * @returns {Promise<Array<string>>} Array of role names, capitalized.
 */
async function getAllRoles() {
    const result = await pool.query(`SELECT role_name FROM roles ORDER BY role_name`);
    return result.rows.map(r => r.role_name.charAt(0).toUpperCase() + r.role_name.slice(1));
}

/**
 * Retrieves all roles assigned to a specific user.
 *
 * @async
 * @function getUserRoles
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Array<string>>} Array of role names assigned to the user, capitalized.
 */
async function getUserRoles(userId) {
    const result = await pool.query(
        `
        SELECT r.role_name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.role_id
        WHERE ur.user_id = $1
        `,
        [userId]
    );

    return result.rows.map(r => r.role_name.charAt(0).toUpperCase() + r.role_name.slice(1));
}

/**
 * Updates the roles assigned to a user.
 * Removes all existing roles and assigns the new list of roles.
 *
 * @async
 * @function updateUserRoles
 * @param {number} userId - The ID of the user to update.
 * @param {Array<string>} roles - Array of role names to assign to the user.
 * @throws Will throw an error if the transaction fails.
 */
async function updateUserRoles(userId, roles) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Remove existing roles
        await client.query(`DELETE FROM user_roles WHERE user_id = $1`, [userId]);

        // Add new roles
        for (const roleName of roles) {
            const roleRes = await client.query(
                `SELECT role_id FROM roles WHERE LOWER(role_name::TEXT) = LOWER($1)`,
                [roleName]
            );

            if (roleRes.rows.length > 0) {
                const roleId = roleRes.rows[0].role_id;
                await client.query(
                    `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
                    [userId, roleId]
                );
            }
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

/**
 * Adds a new user to the database with the specified roles.
 * Password is securely hashed using bcrypt.
 *
 * @async
 * @function addUser
 * @param {string} name - Full name of the user (first and last name).
 * @param {string} email - Email address of the user.
 * @param {string} phone - Phone number of the user.
 * @param {string} password - Plaintext password to be hashed.
 * @param {Array<string>} roles - Array of role names to assign to the user.
 * @returns {Promise<Object>} Object containing the new user's ID.
 * @throws Will throw an error if the transaction fails.
 */
async function addUser(name, email, phone, password, roles) {
    const client = await pool.connect();
    const [firstName, ...rest] = name.trim().split(' ');
    const lastName = rest.join(' ') || '';
    const passwordHash = await bcrypt.hash(password, 10); // secure hash

    try {
        await client.query('BEGIN');

        const userRes = await client.query(
            `INSERT INTO users (first_name, last_name, email, phone_number, password_hash)
       VALUES ($1, $2, $3, $4, $5) RETURNING user_id`,
            [firstName, lastName, email, phone, passwordHash]
        );

        const userId = userRes.rows[0].user_id;

        for (const roleName of roles) {
            const roleRes = await client.query(
                `SELECT role_id FROM roles WHERE LOWER(role_name::TEXT) = LOWER($1)`,
                [roleName]
            );
            if (roleRes.rows.length > 0) {
                const roleId = roleRes.rows[0].role_id;
                await client.query(
                    `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
                    [userId, roleId]
                );
            }
        }

        await client.query('COMMIT');
        return { userId };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

/**
 * Deletes a user and all associated roles from the database.
 *
 * @async
 * @function deleteUser
 * @param {number} userId - The ID of the user to delete.
 * @throws Will throw an error if the transaction fails.
 */
async function deleteUser(userId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`DELETE FROM user_roles WHERE user_id = $1`, [userId]);
        await client.query(`DELETE FROM users WHERE user_id = $1`, [userId]);
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    searchUsers,
    getAllRoles,
    getUserRoles,
    updateUserRoles,
    addUser,
    deleteUser
};
