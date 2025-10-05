const express = require('express')
const router = express.Router()
const CourseModel = require('../models/CourseModel') // assumes you have a model for courses

/**
 * Route: GET /courses/search
 * Supports flexible search by course name (q1) and course ID (q2).
 */
router.get('/search', async (req, res) => {
  const { q1, q2 } = req.query

  try {
    let results = []

    if (q1 && q2) {
      // Both course name and ID provided — narrow search
      results = await CourseModel.findByNameAndId(q1, q2)
    } else if (q1) {
      // Only course name provided — search by name
      results = await CourseModel.findByName(q1)
    } else if (q2) {
      // Only course ID provided — search by ID
      results = await CourseModel.findById(q2)
    } else {
      return res.status(400).json({ message: 'Missing search parameters' })
    }

    // Format: [{ id: 'ECE356', name: 'Computer Networks' }, ...]
    const formatted = results.map(course => ({
      id: course.course_id,
      name: course.course_name,
    }))

    res.json(formatted)
  } catch (error) {
    console.error('Error searching courses:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * Route: GET /courses/lookup
 * Enhanced search by course name (q1) and course code (q2)
 */
router.get('/lookup', async (req, res) => {
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

    res.json(formattedCourses);
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
