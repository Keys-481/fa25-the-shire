const express = require('express')
const router = express.Router()
const CourseModel = require('../models/CourseModel') // assumes you have a model for courses
const { getCourseOfferings, getPrerequisitesForCourse } = require('../models/CourseModel');
const pool = require('../db');

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

    // Fetch offerings and prerequisites for each course
    const enrichedCourses = await Promise.all(courses.map(async course => {
      const offerings = await getCourseOfferings(course.course_id);
      const prerequisites = await getPrerequisitesForCourse(course.course_id);
      return {
        id: course.course_id,
        code: course.course_code,
        name: course.course_name,
        credits: course.credits,
        offerings,
        prerequisites
      };
    }));

    res.json(enrichedCourses);
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new course
router.post('/', async (req, res) => {
  const { name, code, credits, prerequisites } = req.body;

  try {
    // Insert the course
    const result = await pool.query(
      `INSERT INTO courses (course_name, course_code, credits)
       VALUES ($1, $2, $3) RETURNING course_id, course_name, course_code, credits`,
      [name, code, credits]
    );
    const newCourse = result.rows[0];

    // Handle prerequisites
    const prereqCodes = prerequisites
      .split(',')
      .map(c => c.trim())
      .filter(c => c !== '');

    for (const prereqCode of prereqCodes) {
      const prereqRes = await pool.query(
        `SELECT course_id FROM courses WHERE course_code = $1`,
        [prereqCode]
      );
      if (prereqRes.rows.length > 0) {
        await pool.query(
          `INSERT INTO course_prerequisites (course_id, prerequisite_course_id)
           VALUES ($1, $2)`,
          [newCourse.course_id, prereqRes.rows[0].course_id]
        );
      }
    }

    const offeringTerms = (req.body.offerings || '')
      .split(',')
      .map(term => term.trim())
      .filter(term => term !== '');

    for (const term of offeringTerms) {
      await pool.query(
        `INSERT INTO course_offerings (course_id, semester_type) VALUES ($1, $2)`,
        [newCourse.course_id, term]
      );
    }

    res.status(201).json({
      id: newCourse.course_id,
      name: newCourse.course_name,
      code: newCourse.course_code,
      credits: newCourse.credits
    });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update course
router.put('/:id', async (req, res) => {
  const { name, code, credits, offerings, prerequisites } = req.body;
  const courseId = req.params.id;

  if (!courseId || isNaN(courseId)) {
    return res.status(400).json({ message: 'Invalid or missing course ID' });
  }

  try {
    // Update course details
    await pool.query(
      `UPDATE courses SET course_name = $1, course_code = $2, credits = $3 WHERE course_id = $4`,
      [name, code, credits, courseId]
    );

    // Update offerings
    await pool.query(`DELETE FROM course_offerings WHERE course_id = $1`, [courseId]);

    const offeringTerms = (offerings || '')
      .split(',')
      .map(term => term.trim())
      .filter(term => term !== '');

    for (const term of offeringTerms) {
      await pool.query(
        `INSERT INTO course_offerings (course_id, semester_type) VALUES ($1, $2)`,
        [courseId, term]
      );
    }

    // Update prerequisites
    await pool.query(`DELETE FROM course_prerequisites WHERE course_id = $1`, [courseId]);

    const prereqCodes = (prerequisites || '')
      .split(',')
      .map(c => c.trim())
      .filter(c => c !== '');

    for (const prereqCode of prereqCodes) {
      const prereqRes = await pool.query(
        `SELECT course_id FROM courses WHERE course_code = $1`,
        [prereqCode]
      );
      if (prereqRes.rows.length > 0) {
        await pool.query(
          `INSERT INTO course_prerequisites (course_id, prerequisite_course_id)
           VALUES ($1, $2)`,
          [courseId, prereqRes.rows[0].course_id]
        );
      }
    }

    // Return updated course
    const updatedCourse = await pool.query(
      `SELECT course_id, course_name, course_code, credits FROM courses WHERE course_id = $1`,
      [courseId]
    );

    res.json({
      id: updatedCourse.rows[0].course_id,
      name: updatedCourse.rows[0].course_name,
      code: updatedCourse.rows[0].course_code,
      credits: updatedCourse.rows[0].credits
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Delete course
router.delete('/:id', async (req, res) => {
  const courseId = req.params.id;

  try {
    await pool.query(`DELETE FROM courses WHERE course_id = $1`, [courseId]);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
