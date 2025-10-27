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
            u.public_id AS public,
            CONCAT(u.first_name, ' ', u.last_name) AS name,
            COALESCE(ARRAY_AGG(DISTINCT r.role_name::TEXT), ARRAY[]::TEXT[]) AS roles
        FROM users u
        LEFT JOIN user_roles ur ON u.user_id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.role_id
        WHERE u.user_id = ANY($1)
        GROUP BY u.user_id, u.public_id, u.first_name, u.last_name
        `,
        [userIds]
    );

    return result.rows.map(row => ({
        id: row.id,
        public: row.public,
        name: row.name,
        roles: row.roles
    }));
}

/**
 * Retrieves all available roles from the database.
 *
 * @async
 * @function getAllRoles
 * @returns {Promise<Array<string>>} Array of role objects.
 */
async function getAllRoles() {
    const result = await pool.query(`SELECT role_id, role_name FROM roles ORDER BY role_name`);
    return result.rows.map(r => ({
        role_id: r.role_id,
        role_name: r.role_name
    }));
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

        const defaultViewRes = await client.query(
            `SELECT default_view FROM users WHERE user_id = $1`,
            [userId]
        );
        const defaultViewId = defaultViewRes.rows[0]?.default_view;

        // Add new roles
        const roleIds = new Set();
        for (const roleName of roles) {
            const roleRes = await client.query(
                `SELECT role_id FROM roles WHERE LOWER(role_name::TEXT) = LOWER($1)`,
                [roleName]
            );

            if (roleRes.rows.length > 0) {
                roleIds.add(roleRes.rows[0].role_id);
            }
        }

        if (defaultViewId) {
            roleIds.add(defaultViewId);
        }

        await client.query(`DELETE FROM user_roles WHERE user_id = $1`, [userId]);

        for (const roleId of roleIds) {
            await client.query(
                `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
                [userId, roleId]
            );
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
 * @param {string} defaultView - Default view role name.
 * @param {Array<string>} roles - Array of role names to assign to the user.
 * @returns {Promise<Object>} Object containing the new user's ID.
 * @throws Will throw an error if the transaction fails.
 */
async function addUser(name, email, phone, password, defaultView, roles) {
    const client = await pool.connect();
    const [firstName, ...rest] = name.trim().split(' ');
    const lastName = rest.join(' ') || '';
    const passwordHash = await bcrypt.hash(password, 10); // secure hash

    try {
        await client.query('BEGIN');

        // Get role_id for defaultView
        const defaultViewRes = await client.query(
            `SELECT role_id FROM roles WHERE LOWER(role_name::TEXT) = LOWER($1)`,
            [defaultView]
        );
        const defaultViewId = defaultViewRes.rows[0]?.role_id;
        if (!defaultViewId) throw new Error('Invalid default view role');

        // TEMP insert to get user_id
        const tempUserRes = await client.query(
            `SELECT nextval('users_user_id_seq') AS next_id`
        );
        const nextUserId = tempUserRes.rows[0].next_id;
        const publicId = `${String(nextUserId).padStart(9, '0')}`;

        // Insert user with public_id
        const userRes = await client.query(
            `INSERT INTO users (user_id, first_name, last_name, email, phone_number, password_hash, default_view, public_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING user_id`,
            [nextUserId, firstName, lastName, email, phone, passwordHash, defaultViewId, publicId]
        );
        const userId = userRes.rows[0].user_id;

        // Resolve role_ids
        const roleIds = new Set();
        for (const roleName of roles) {
            const roleRes = await client.query(
                `SELECT role_id FROM roles WHERE LOWER(role_name::TEXT) = LOWER($1)`,
                [roleName]
            );
            if (roleRes.rows.length > 0) {
                roleIds.add(roleRes.rows[0].role_id);
            }
        }

        roleIds.add(defaultViewId);

        for (const roleId of roleIds) {
            await client.query(
                `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
                [userId, roleId]
            );
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

/**
 * Gets all permissions associated with a specific role.
 *
 * @async
 * @function getRolePermissions
 * @param {string} roleName - The name of the role.
 * @returns {Promise<Array<string>>} Array of permission names.
 */
async function getRolePermissions(roleName) {
    const result = await pool.query(
        `
        SELECT p.permission_name
        FROM roles r
        JOIN role_permissions rp ON r.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.permission_id
        WHERE LOWER(r.role_name::TEXT) = LOWER($1)
        ORDER BY p.permission_name
        `,
        [roleName]
    );

    return result.rows.map(row => row.permission_name);
}

/**
 * Gets all available permissions in the system.
 *
 * @async
 * @function getAllPermissions
 * @returns {Promise<Array>} Array of all permission names.
 */
async function getAllPermissions() {
    const query = `SELECT permission_name FROM permissions ORDER BY permission_name`;
    const result = await pool.query(query);
    return result.rows;
}

module.exports = {
    searchUsers,
    getAllRoles,
    getUserRoles,
    updateUserRoles,
    addUser,
    deleteUser,
    getRolePermissions,
    getAllPermissions
};
