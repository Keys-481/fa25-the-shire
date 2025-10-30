const request = require('supertest');
const express = require('express');
const usersRouter = require('../../src/routes/users');
const pool = require('../../src/db');

const app = express();
app.use(express.json());
app.use('/users', usersRouter);

let testUserId;

/**
 * Test: POST /users and DELETE /api/users/:id
 *
 * This test performs the following steps:
 * 1. Sends a POST request to create a new user with the "Advisor" role.
 * 2. Verifies that the response status is 200 and a userId is returned.
 * 3. Sends a DELETE request to remove the newly created user.
 * 4. Verifies that the deletion response status is 200 and confirms success.
 */
test('POST /users and DELETE /api/users/:id', async () => {
  const timestamp = Date.now();
  const res = await request(app).post('/users').send({
    name: 'Route Tester',
    email: `route${timestamp}@test.com`,
    phone: '555-111-2222',
    password: 'testpass',
    default_view: 'Advisor',
    roles: ['Advisor']
  });

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('userId');
  testUserId = res.body.userId;

  const delRes = await request(app).delete(`/api/users/${testUserId}`);
  expect(delRes.statusCode).toBe(200);
  expect(delRes.body).toEqual({ success: true });
});

/**
 * Cleanup: Close the database connection after all tests complete.
 */
afterAll(async () => {
  await pool.end();
});
