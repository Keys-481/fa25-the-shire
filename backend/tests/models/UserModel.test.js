const UserModel = require('../../src/models/UserModel');
const pool = require('../../src/db');

let testUserId;

/**
 * Begins a database transaction before all tests.
 * Ensures that changes made during tests can be rolled back.
 */
beforeAll(async () => {
  // start a transaction
  await pool.query('BEGIN');
});

/**
 * Rolls back the transaction and closes the database connection after all tests.
 * This cleanup ensures no test data persists in the database.
 */
afterAll(async () => {
  // rollback if you used BEGIN
  await pool.query('ROLLBACK');
  await pool.end();
});

/**
 * Test: addUser creates and deletes a user safely
 *
 * This test performs the following steps:
 * 1. Creates a new user with a unique email and the "Student" role.
 * 2. Verifies that the user ID is returned and defined.
 * 3. Confirms that the assigned role includes "Student".
 * 4. Deletes the user.
 * 5. Verifies that the user's roles are removed after deletion.
 */
test('addUser creates and deletes a user safely', async () => {
  const timestamp = Date.now();
  const email = `testuser${timestamp}@example.com`;

  const result = await UserModel.addUser(
    'Test User',
    email,
    '555-000-0000',
    'securepass',
    'Student', //default view
    ['Student'] // roles
  );

  testUserId = result.userId;
  expect(testUserId).toBeDefined();

  const roles = await UserModel.getUserRoles(testUserId);
  expect(roles).toContain('Student');

  // Cleanup
  await UserModel.deleteUser(testUserId);
  const deletedRoles = await UserModel.getUserRoles(testUserId);
  expect(deletedRoles).toEqual([]);
});
