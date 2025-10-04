const express = require('express');
const router = express.Router();
const CourseModel = require('../models/CourseModel');

/**
 * Route: GET /courses/search
 * Supports searching by course name (q1), course code (q2), or both.
 */
router.get('/search', async (req, res) => {
    const { q1, q2 } = req.query;

    if (!q1 && !q2) {
        return res.status(400).json({ message: 'Missing search parameters: course name (q1) or course code (q2)' });
    }

    try {
        const courses = await CourseModel.searchCourses({ name: q1, code: q2 });

        if (!courses || courses.length === 0) {
            return res.status(404).json({ message: 'No matching courses found' });
        }

        const formattedCourses = courses.map(course => ({
            id: course.course_id,
            code: course.course_code,
            name: course.course_name,
            credits: course.credits
        }));

        return res.json(formattedCourses);
    } catch (error) {
        console.error('Error searching courses:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
