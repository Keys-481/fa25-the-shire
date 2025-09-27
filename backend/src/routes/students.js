/**
 * File: backend/src/routes/students.js
 * This file defines the routes for student-related operations.
 */

const express = require('express');
const router = express.Router();
const StudentModel = require('../models/StudentModel');
const AccessModel = require('../models/AccessModel');

/**
 * Route: GET /students/:schoolId
 * Retrieves a student by their school ID.
 */
router.get('/:schoolId', async (req, res) => {
    const { schoolId } = req.params;
    try {
        // Expect req.user to be set by middleware (mock or real auth)
        const currentUser = req.user;
        if (!currentUser || !currentUser.user_id) {
            return res.status(401).json({ message: 'Unauthorized: No user info' });
        }

        // get student by schoolId
        const student = await StudentModel.getStudentBySchoolId(schoolId);

        // check if student exists
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // check access permissions
        const userRoles = await AccessModel.getUserRoles(currentUser.user_id);
        if (userRoles.includes('admin')) {
            // admin has access to all students
            return res.json(student);
        }
        if (userRoles.includes('advisor')) {
            const hasAccess = await AccessModel.isAdvisorOfStudent(currentUser.user_id, student.student_id);
            if (hasAccess) {
                return res.json(student);
            } else {
                return res.status(404).json({ message: 'Student not found' });
            }
        }

    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

