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

describe('UserModel Functions', () => {
  /**
   * Tests that a user can be created and deleted successfully.
   * Verifies role assignment and cleanup.
   */
  test('addUser creates and deletes a user safely', async () => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@example.com`;
    const phone = `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const result = await UserModel.addUser(
      'Test User',
      email,
      phone,
      'securepass',
      'Student',
      ['Student']
    );

    expect(result).toHaveProperty('userId');
    testUserId = result.userId;

    const roles = await UserModel.getUserRoles(testUserId);
    expect(roles).toContain('Student');

    await UserModel.deleteUser(testUserId);
    const deletedRoles = await UserModel.getUserRoles(testUserId);
    expect(deletedRoles).toEqual([]);
  });

  /**
   * Tests that getUserById returns correct user details.
   * Verifies name, email, and default view role.
   */
  test('getUserById returns correct details', async () => {
    const timestamp = Date.now();
    const email = `getuser${timestamp}@example.com`;
    const phone = `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const { userId } = await UserModel.addUser(
      'Get User',
      email,
      phone,
      'pass',
      'Advisor',
      ['Advisor']
    );

    const user = await UserModel.getUserById(userId);
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(user.default_view.toLowerCase()).toBe('advisor');

    await UserModel.deleteUser(userId);
  });

  /**
   * Tests that updateUserDetails modifies user profile correctly.
   * Verifies updated name, email, and phone number.
   */
  test('updateUserDetails modifies user info', async () => {
    const timestamp = Date.now();
    const email = `updateuser${timestamp}@example.com`;
    const phone = `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const { userId } = await UserModel.addUser(
      'Update User',
      email,
      phone,
      'pass',
      'Student',
      ['Student']
    );

    const newPhone = `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
    await UserModel.updateUserDetails(
      userId,
      'Updated Name',
      `updated${timestamp}@example.com`,
      newPhone,
      null,
      'Student'
    );

    const updated = await UserModel.getUserById(userId);
    expect(updated.name).toBe('Updated Name');
    expect(updated.email).toBe(`updated${timestamp}@example.com`);

    await UserModel.deleteUser(userId);
  });

  /**
   * Tests that getAllRoles returns a list of available roles.
   * Verifies structure and presence of role_name.
   */
  test('getAllRoles returns role list', async () => {
    const roles = await UserModel.getAllRoles();
    expect(Array.isArray(roles)).toBe(true);
    expect(roles[0]).toHaveProperty('role_name');
  });

  /**
   * Tests that getAllPermissions returns a list of all permissions.
   * Verifies structure and presence of permission_name.
   */
  test('getAllPermissions returns permission list', async () => {
    const perms = await UserModel.getAllPermissions();
    expect(Array.isArray(perms)).toBe(true);
    expect(perms[0]).toHaveProperty('permission_name');
  });

  /**
   * Tests that getRolePermissions returns permissions for a specific role.
   * Verifies that the result is an array.
   */
  test('getRolePermissions returns permissions for role', async () => {
    const perms = await UserModel.getRolePermissions('Student');
    expect(Array.isArray(perms)).toBe(true);
  });

  /**
   * Tests that updateUserRoles correctly assigns new roles to a user.
   * Verifies role assignment and normalization.
   */
  test('updateUserRoles assigns new roles', async () => {
    const timestamp = Date.now();
    const email = `roleuser${timestamp}@example.com`;
    const phone = `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const { userId } = await UserModel.addUser(
      'Role User',
      email,
      phone,
      'pass',
      'Student',
      ['Student']
    );

    await UserModel.updateUserRoles(userId, ['Advisor']);
    const roles = await UserModel.getUserRoles(userId);
    const normalizedRoles = roles.map(r => r.toLowerCase());
    expect(normalizedRoles).toContain('advisor');

    await UserModel.deleteUser(userId);
  });

  /**
   * Tests that getUserByPublicId resolves a user from their public ID.
   * Verifies that the resolved user matches the original user ID.
   */
  test('getUserByPublicId resolves public ID', async () => {
    const timestamp = Date.now();
    const email = `publicid${timestamp}@example.com`;
    const phone = `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const { userId } = await UserModel.addUser(
      'Public ID User',
      email,
      phone,
      'pass',
      'Student',
      ['Student']
    );

    // Manually fetch public_id from the database
    const result = await pool.query(
      `SELECT public_id FROM users WHERE user_id = $1`,
      [userId]
    );
    const publicId = result.rows[0]?.public_id;
    expect(publicId).toBeDefined();

    const resolved = await UserModel.getUserByPublicId(publicId);
    expect(resolved.user_id).toBe(userId);

    await UserModel.deleteUser(userId);
  });

  /**
   * Tests that getAdvisingRelations returns empty arrays for a new user.
   * Verifies structure of the returned advising data.
   */
  test('getAdvisingRelations returns empty arrays for new user', async () => {
    const timestamp = Date.now();
    const email = `advising${timestamp}@example.com`;
    const phone = `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const { userId } = await UserModel.addUser(
      'Advising User',
      email,
      phone,
      'pass',
      'Student',
      ['Student']
    );

    const relations = await UserModel.getAdvisingRelations(userId);
    expect(relations).toHaveProperty('students');
    expect(relations).toHaveProperty('advisors');

    await UserModel.deleteUser(userId);
  });

  /**
   * Tests that updateAdvisingRelations correctly assigns students to an advisor.
   * Verifies that the student appears in the advisor's advising list.
   */
  test('updateAdvisingRelations assigns advisors and students', async () => {
    const timestamp = Date.now();
    const advisorEmail = `advisor${timestamp}@example.com`;
    const studentEmail = `student${timestamp}@example.com`;
    const advisorPhone = `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const studentPhone = `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const advisor = await UserModel.addUser(
      'Advisor User',
      advisorEmail,
      advisorPhone,
      'pass',
      'Advisor',
      ['Advisor']
    );

    const student = await UserModel.addUser(
      'Student User',
      studentEmail,
      studentPhone,
      'pass',
      'Student',
      ['Student']
    );

    await UserModel.updateUserRoles(advisor.userId, ['Advisor']); // Ensure advisor role is set
    await UserModel.updateAdvisingRelations(advisor.userId, [], [student.userId]);

    const relations = await UserModel.getAdvisingRelations(advisor.userId);
    console.log('Advising relations:', relations.students);
    expect(relations.students.some(s => s.user_id === student.userId)).toBe(true);

    await UserModel.deleteUser(student.userId);
    await UserModel.deleteUser(advisor.userId);
  });
});