/**
 * File: backend/src/routes/students.js
 * This file defines the routes for student-related operations.
 */

const express = require('express');
const router = express.Router();
const StudentModel = require('../models/StudentModel');
const AccessModel = require('../models/AccessModel');
const DegreePlanModel = require('../models/DegreePlanModel');
const CourseModel = require('../models/CourseModel');


/**
 * Route: GET /students/search
 * Supports searching for a student by their school ID (q1)
 * Will implement flexible search later (name, phone)
 */
router.get('/search', async (req, res) => {
    const { q1 } = req.query;

    if (!q1) {
        return res.status(400).json({ message: 'Missing school ID (q1)' });
    }

    try {
        // Expect req.user to be set by middleware (mock or real auth)
        req.user = req.user || { user_id: 1 }; // mock user for development (no login yet)
        const currentUser = req.user;
        if (!currentUser || !currentUser.user_id) {
            return res.status(401).json({ message: 'Unauthorized: No user info' });
        }

        // get student by schoolId
        const student = await StudentModel.getStudentBySchoolId(q1);

        // check if student exists
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // check access permissions
        const userRoles = await AccessModel.getUserRoles(currentUser.user_id);
        let hasAccess = true; // default to false (true for testing, change to false)

        if (userRoles.includes('admin')) {
            hasAccess = true;
        } else if (userRoles.includes('advisor')) {
            hasAccess = await AccessModel.isAdvisorOfStudent(currentUser.user_id, student.student_id);
        }

        if (!hasAccess) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // user has access, return student info
        const formatted_student = [
            {
                id: student.school_student_id,
                name: `${student.first_name} ${student.last_name}`,
                email: student.email,
                phone: student.phone_number,
                program: student.program_name || 'N/A'
            },
        ];
        return res.json(formatted_student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

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

/**
 * Route: GET /students/:schoolId/degree-plan
 * Retrieves the degree plan and student info for a student by their school ID.
 */
router.get('/:schoolId/degree-plan', async (req, res) => {
    const { schoolId } = req.params;
    try {
        // Expect req.user to be set by middleware (mock or real auth)
        req.user = req.user || { user_id: 1 }; // mock user for development (no login yet)
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
        let hasAccess = false;

        if (userRoles.includes('admin')) {
            hasAccess = true;
        } else if (userRoles.includes('advisor')) {
            hasAccess = await AccessModel.isAdvisorOfStudent(currentUser.user_id, student.student_id);
        }

        if (hasAccess) {
            let degreePlan = await DegreePlanModel.getDegreePlanByStudentId(student.student_id);

            // add prerequisites to each course in the degree plan
            degreePlan = await Promise.all(
                degreePlan.map(async (course) => {
                    const prerequisites = await CourseModel.getPrerequisitesForCourse(course.course_id);
                    const offered_semesters = await CourseModel.getCourseOfferings(course.course_id);
                    return {
                        ...course,
                        prerequisites,
                        offered_semesters
                    };
                })
            );
            return res.json({ student, degreePlan });
        } else {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this student\'s degree plan' });
        }
    } catch (error) {
        console.error('Error fetching degree plan:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

