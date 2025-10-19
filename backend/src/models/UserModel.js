const pool = require('../db');

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


module.exports = {
    searchUsers,
    getAllRoles,
    getUserRoles,
};


