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


const { log, error } = require('console');


/**
 * Route: GET /students/search
 * Supports searching for a student by their school ID, and partial or full name (q1, q2).
 * Will implement search by phone later.
 * 
 * @response 400 - Missing search parameters
 * @response 401 - Unauthorized: No user info
 * @response 404 - Student not found
 * @response 500 - Internal server error
 * @response 200 - OK
 * @returns A list of students matching the search criteria
 */
router.get('/search', async (req, res) => {
    const { q1, q2 } = req.query;

    try {
        // Expect req.user to be set by middleware (mock or real auth)
        req.user = req.user || { user_id: 1 }; // mock user for development (no login yet)
        const currentUser = req.user;
        if (!currentUser || !currentUser.user_id) {
            return res.status(401).json({ message: 'Unauthorized: No user info' });
        }


        let students = [];
        if (q1 && q2) {
            // Both school ID and name provided
            students = await StudentModel.getStudentBySchoolIdAndName(q1, q2);
        } else if (q1) {
            students = await StudentModel.getStudentBySchoolId(q1);
        } else if (q2) {
            students = await StudentModel.getStudentByName(q2);
        } else {
            return res.status(400).json({ message: 'Missing search parameters: school ID or name' });
        }

        // check if student exists
        if (!students || students.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // get user roles
        const userRoles = await AccessModel.getUserRoles(currentUser.user_id);
        const isAdmin = userRoles.includes('admin');
        const isAdvisor = userRoles.includes('advisor');

        // check access permissions
        const accessChecks = students.map(async (student) => {
            if (isAdmin) {
                return true;
            } else if (isAdvisor) {
                return await AccessModel.isAdvisorOfStudent(currentUser.user_id, student.student_id);
            }
            return false;
        });

        const accessResults = await Promise.all(accessChecks);

        // Filter students based on access results
        let accessibleStudents = students.filter((_, index) => accessResults[index]);

        if (accessibleStudents.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // user has access, return student info
        const formatted_student = accessibleStudents.map(student => ({
            id: student.school_student_id,
            name: `${student.first_name} ${student.last_name}`,
            email: student.email,
            phone: student.phone_number
        }));
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
        const studentResult = await StudentModel.getStudentBySchoolId(schoolId);
        const student = studentResult && studentResult.length > 0 ? studentResult[0] : null;

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
 * Retrieves the degree plan for a student and program by their school ID.
 * Query params:
 *   - programId: internal program ID
 *   - viewType: 'semester' or 'requirements'
 */
router.get('/:schoolId/degree-plan', async (req, res) => {
    const { schoolId } = req.params;
    const { programId, viewType } = req.query;

    try {
        // Expect req.user to be set by middleware (mock or real auth)
        req.user = req.user || { user_id: 1 }; // mock user for development (no login yet)
        const currentUser = req.user;
        if (!currentUser || !currentUser.user_id) {
            return res.status(401).json({ message: 'Unauthorized: No user info' });
        }

        // get student by schoolId
        const studentResult = await StudentModel.getStudentBySchoolId(schoolId);
        const student = studentResult && studentResult.length > 0 ? studentResult[0] : null;

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
            let degreePlan = [];
            
            if (viewType == 'requirements') {
                degreePlan = await DegreePlanModel.getDegreePlanByRequirements(student.student_id, programId);
            } else {
                degreePlan = await DegreePlanModel.getDegreePlanByStudentId(student.student_id, programId);
            }

            if (!programId) {
                return res.status(400).json({ message: 'Missing programId query parameter' });
            }

            // Get total required credits for the program
            const totalRequiredCredits = await DegreePlanModel.getTotalProgramRequiredCredits(programId);

            // add prerequisites and course offerings to each course in the degree plan
            degreePlan = await Promise.all(
                degreePlan.map(async (course) => {
                    const prerequisites = await CourseModel.getPrerequisitesForCourse(course.course_id);
                    const offered_semesters = await CourseModel.getCourseOfferings(course.course_id);
                    const certificate_overlaps = await CourseModel.getCertificateOverlaps(course.course_id);
                    const semester_options = await CourseModel.getSemesterOptionsForCourse(course.course_id);
                    return {
                        ...course,
                        prerequisites,
                        offered_semesters,
                        certificate_overlaps,
                        semester_options
                    };
                })
            );
            console.log("Degree Plan: ", degreePlan);
            return res.json({ student, programId, viewType, degreePlan, totalRequiredCredits });
        } else {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this student\'s degree plan' });
        }
    } catch (error) {
        console.error('Error fetching degree plan:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * Route: GET /students/:schoolId/programs
 * Retrieves all programs associated with a student by their school ID.
 */
router.get('/:schoolId/programs', async (req, res) => {
    const { schoolId } = req.params;

    try {
        // Expect req.user to be set by middleware (mock or real auth)
        req.user = req.user || { user_id: 1 }; // mock user for development (no login yet)
        const currentUser = req.user;
        if (!currentUser || !currentUser.user_id) {
            return res.status(401).json({ message: 'Unauthorized: No user info' });
        }

        // get student by schoolId
        const studentResult = await StudentModel.getStudentBySchoolId(schoolId);
        const student = studentResult && studentResult.length > 0 ? studentResult[0] : null;

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
            const programs = await StudentModel.getProgramsByStudentId(student.student_id);
            return res.json({ student, programs });
        } else {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this student\'s programs' });
        }
    } catch (error) {
        console.error('Error fetching student programs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * Route: PATCH /students/:schoolId/degree-plan/course/:courseId
 * Updates the status of a course in a student's degree plan (e.g., mark as completed, in-progress).
 * If status set to 'Planned', semesterId must be provided.
 *
 * Body params:
 *  - status: 'Completed', 'In Progress', 'Planned'
 *  - courseId: internal course ID
 *  - semesterId: internal semester ID (required if status is 'Planned')
 *  - programId: internal program ID
 *
 * @returns Updated course info in the degree plan
 * @response 400 - Missing parameters
 * @response 401 - Unauthorized: No user info
 * @response 403 - Forbidden: No access to student
 * @response 404 - Student or course not found
 * @response 500 - Internal server error
 * @response 200 - OK
 */
router.patch('/:schoolId/degree-plan/course', async (req, res) => {
    const { schoolId } = req.params;
    const { courseId, status, semesterId, programId } = req.body;

    try {
        // Expect req.user to be set by middleware (mock or real auth)
        req.user = req.user || { user_id: 1 }; // mock user for development (no login yet)
        const currentUser = req.user;
        if (!currentUser || !currentUser.user_id) {
            return res.status(401).json({ message: 'Unauthorized: No user info' });
        }

        // validate input
        if (!status || !['Unplanned', 'Planned', 'In Progress', 'Completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid or missing status. Must be one of: Unplanned, Planned, In Progress, Completed' });
        }
        if (status === 'Planned' && !semesterId) {
            return res.status(400).json({ message: 'semesterId is required when status is Planned' });
        }

        // get student by schoolId
        const studentResult = await StudentModel.getStudentBySchoolId(schoolId);
        const student = studentResult && studentResult.length > 0 ? studentResult[0] : null;

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

        if (!hasAccess) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this student\'s degree plan' });
        }

        // update course status in degree plan
        const updatedCourse = await DegreePlanModel.updateCourseStatus(
            student.student_id,
            courseId,
            status,
            semesterId,
            programId
        );

        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found in student\'s degree plan' });
        }
        console.log("Updated Course: ", updatedCourse);
        return res.json(updatedCourse);

    } catch (error) {
        console.error('Error updating course status in degree plan:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;