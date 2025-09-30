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

module.exports = router