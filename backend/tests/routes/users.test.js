const request = require('supertest');
const express = require('express');
const usersRouter = require('../../src/routes/users');
const pool = require('../../src/db');

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);

let createdUserId;

/**
 * Closes the database connection after all tests complete.
 * Ensures proper cleanup of pooled resources.
 */
afterAll(async () => {
  await pool.end();
});

describe('User Routes', () => {
  const dynamicPhone = `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
  /**
   * Tests POST /api/users
   * Creates a new user with the Advisor role and verifies successful creation.
   */
  test('POST /api/users - create user', async () => {
    const timestamp = Date.now();
    const res = await request(app).post('/api/users').send({
      name: 'Route Tester',
      email: `route${timestamp}@test.com`,
      phone: dynamicPhone,
      password: 'testpass',
      default_view: 'Advisor',
      roles: ['Advisor']
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('userId');
    createdUserId = res.body.userId;
  });

  /**
   * Tests GET /api/users/:id
   * Fetches user details by ID and verifies name and email fields.
   */
  test('GET /api/users/:id - fetch user details', async () => {
    const res = await request(app).get(`/api/users/${createdUserId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('email');
  });

  /**
   * Tests GET /api/users/:id/roles
   * Fetches roles assigned to the user and verifies Advisor role is present.
   */
  test('GET /api/users/:id/roles - fetch user roles', async () => {
    const res = await request(app).get(`/api/users/${createdUserId}/roles`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toContain('Advisor');
  });

  /**
   * Tests PUT /api/users/:id
   * Updates user details and verifies success response.
   */
  test('PUT /api/users/:id - update user details', async () => {
    const res = await request(app).put(`/api/users/${createdUserId}`).send({
      name: 'Updated Tester',
      email: 'updated@test.com',
      phone: dynamicPhone,
      password: 'newpass',
      default_view: 'Advisor'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  /**
   * Tests GET /api/users/all
   * Fetches all users and verifies response is an array.
   */
  test('GET /api/users/all - fetch all users', async () => {
    const res = await request(app).get('/api/users/all');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  /**
   * Tests GET /api/users/roles
   * Fetches all available roles and verifies response structure.
   */
  test('GET /api/users/roles - fetch all roles', async () => {
    const res = await request(app).get('/api/users/roles');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  /**
   * Tests GET /api/users/permissions
   * Fetches all available permissions and verifies response structure.
   */
  test('GET /api/users/permissions - fetch all permissions', async () => {
    const res = await request(app).get('/api/users/permissions');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  /**
   * Tests GET /api/users/:id/advising
   * Fetches advising relationships for the user and verifies structure.
   */
  test('GET /api/users/:id/advising - fetch advising relations', async () => {
    const res = await request(app).get(`/api/users/${createdUserId}/advising`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('students');
    expect(res.body).toHaveProperty('advisors');
  });

  /**
   * Tests DELETE /api/users/:id
   * Deletes the created user and verifies success response.
   */
  test('DELETE /api/users/:id - delete user', async () => {
    const res = await request(app).delete(`/api/users/${createdUserId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});
