/**
 * File: backend/tests/routes/comments.test.js
 * Integration tests for comments routes
 */

const request = require('supertest');
const express = require('express');
const { runSchemaAndSeeds } = require('../../db_setup');
const pool = require('../../src/db');
const commentRoutes = require('../../src/routes/comments');

let client;

// Reset and seed the database before each test
beforeAll(async () => {
    await runSchemaAndSeeds();
});

// Start a transaction before each test
beforeEach(async () => {
    client = await pool.connect();
    await client.query('BEGIN;');
});

// Discard any changes after each test
afterEach(async () => {
    await client.query('ROLLBACK;');
    client.release();
});

// Close the database connection after all tests
afterAll(async () => {
    await pool.end();
});


/**
 * Helper function to create an Express app with mocked authentication
 * @param mockUser - The user object to set in req.user
 * @returns Express app with mocked authentication middleware
 */
function makeAppWithUser(mockUser) {
    const app = express();
    app.use(express.json());

    // mock authentication middleware
    app.use((req, res, next) => {
        req.user = mockUser;
        next();
    });

    app.use('/comments', commentRoutes);
    return app;
}

/**
 * Tests for GET /comments route
 */
describe('GET /comments', () => {
    // test for successful retrieval of comments (admin user)
    test('returns 200 and comments for valid programId and studentSchoolId', async () => {
        const mockUser = { user_id: 1 }; // admin in seed data
        const app = makeAppWithUser(mockUser);

        const response = await request(app)
            .get('/comments')
            .query({ programId: 1, studentSchoolId: '112299690' }); // Alice Johnson's school ID from seed data

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // test for successful retrieval of comments (advisor user with access)
    test('returns 200 and comments for advisor with access', async () => {
        const mockUser = { user_id: 2 }; // advisor in seed data
        const app = makeAppWithUser(mockUser);

        const response = await request(app)
            .get('/comments')
            .query({ programId: 1, studentSchoolId: '112299690' }); // Alice Johnson's school ID from seed data

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // test for successful retrieval of comments (student user accessing own comments)
    test('returns 200 and comments for student accessing own comments', async () => {
        const mockUser = { user_id: 4 }; // student Alice Johnson in seed data
        const app = makeAppWithUser(mockUser);

        const response = await request(app)
            .get('/comments')
            .query({ programId: 1, studentSchoolId: '112299690' }); // Alice Johnson's school ID from seed data

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // test for missing query parameters
    test('returns 400 for missing query parameters', async () => {
        const mockUser = { user_id: 1 }; // Mock authenticated user
        const app = makeAppWithUser(mockUser);

        const response = await request(app)
            .get('/comments')
            .query({ programId: 1 }); // Missing studentSchoolId

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Missing required query parameters: programId, studentSchoolId');
    });

    // test for failed access (advisor without access)
    test('returns 403 for advisor without access', async () => {
        const mockUser = { user_id: 3 }; // advisor without access in seed data
        const app = makeAppWithUser(mockUser);

        const response = await request(app)
            .get('/comments')
            .query({ programId: 1, studentSchoolId: '112299690' }); // Alice Johnson's school ID from seed data

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Forbidden: You do not have permission to view comments for this degree plan');
    });

    // test for student trying to access another student's comments
    test('returns 403 for student trying to access another student\'s comments', async () => {
        const mockUser = { user_id: 5 }; // student Bob Smith in seed data
        const app = makeAppWithUser(mockUser);

        const response = await request(app)
            .get('/comments')
            .query({ programId: 1, studentSchoolId: '112299690' }); // Alice Johnson's school ID from seed data

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Forbidden: You do not have permission to view comments for this degree plan');
    });
});

/**
 * Tests for POST /comments route
 */
describe('POST /comments', () => {
    // test for successful comment creation (admin user)
    test('returns 201 and creates a new comment for valid input', async () => {
        const mockUser = { user_id: 1 }; // admin user
        const app = makeAppWithUser(mockUser);

        const newCommentData = {
            programId: 1,
            studentSchoolId: '112299690',
            commentText: 'This is a test comment.'
        };

        const response = await request(app)
            .post('/comments')
            .send(newCommentData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('comment_id');
        expect(response.body.comment_text).toBe(newCommentData.commentText.trim());
    });

    // test for missing required fields
    test('returns 400 for missing required fields', async () => {
        const mockUser = { user_id: 1 }; // admin user
        const app = makeAppWithUser(mockUser);

        const newCommentData = {
            programId: 1,
            // Missing studentSchoolId and commentText
        };

        const response = await request(app)
            .post('/comments')
            .send(newCommentData);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Missing required fields: programId, studentSchoolId, authorId, commentText');
    });

    // test for unauthorized access (advisor without access)
    test('returns 403 for advisor without access', async () => {
        const mockUser = { user_id: 3 }; // advisor without access
        const app = makeAppWithUser(mockUser);

        const newCommentData = {
            programId: 1,
            studentSchoolId: '112299690',
            commentText: 'This is a test comment.'
        };

        const response = await request(app)
            .post('/comments')
            .send(newCommentData);

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Forbidden: You do not have permission to comment on this degree plan');
    });
});

/**
 * Tests for PUT /comments/:id route
 */
describe('PUT /comments/:id', () => {
    // test for successful comment update
    test('returns 200 and updates the comment for valid input', async () => {
        const mockUser = { user_id: 2 }; // advisor who authored the comment
        const app = makeAppWithUser(mockUser);

        const updatedCommentText = 'This is an updated test comment.';

        const response = await request(app)
            .put('/comments/1') // assuming comment with ID 1 exists and was authored by user_id 2
            .send({ newText: updatedCommentText });

        expect(response.status).toBe(200);
        expect(response.body.comment_id).toBe(1);
        expect(response.body.comment_text).toBe(updatedCommentText);
    });

    // test for missing required fields
    test('returns 400 for missing required fields', async () => {
        const mockUser = { user_id: 2 }; // advisor who authored the comment
        const app = makeAppWithUser(mockUser);

        const response = await request(app)
            .put('/comments/1') // assuming comment with ID 1 exists
            .send({}); // missing newText

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Missing required parameters: commentId, newText');
    });
});
