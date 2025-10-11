const express = require('express')
const router = express.Router()
const CourseModel = require('../models/CourseModel')
const { createCourse, updateCourse, deleteCourse, getCourseOfferings, getPrerequisitesForCourse } = require('../models/CourseModel');
const pool = require('../db');

/**
 * @route GET /courses/search
 * @description Searches for courses based on course name (q1), course code (q2), or both.
 *              Returns enriched course data including offerings and prerequisites.
 * @access Public
 *
 * @queryParam {string} [q1] - Partial or full course name to search for.
 * @queryParam {string} [q2] - Partial or full course code to search for.
 *
 * @response 200 - Returns an array of enriched course objects:
 *   [
 *     {
 *       id: number,
 *       code: string,
 *       name: string,
 *       credits: number,
 *       offerings: string,           // Comma-separated semester codes (e.g., "FA, SP")
 *       prerequisites: Array<{       // Array of prerequisite course objects
 *         course_id: number,
 *         course_code: string,
 *         course_name: string,
 *         credits: number
 *       }>
 *     },
 *     ...
 *   ]
 * @response 400 - Missing query parameters (neither q1 nor q2 provided).
 * @response 404 - No matching courses found for the given search criteria.
 * @response 500 - Internal server error if search or enrichment fails.
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

/**
 * @route POST /courses
 * @description Creates a new course with optional prerequisites and semester offerings.
 * @access Public
 *
 * @bodyParam {string} name - The name of the course.
 * @bodyParam {string} code - The course code (e.g., "OPWL-536").
 * @bodyParam {number} credits - The number of credits for the course.
 * @bodyParam {string} [prerequisites] - Comma-separated course codes that are prerequisites.
 * @bodyParam {string} [offerings] - Comma-separated semester codes (e.g., "FA, SP").
 *
 * @response 201 - Returns the newly created course object:
 *   {
 *     id: number,
 *     name: string,
 *     code: string,
 *     credits: number
 *   }
 * @response 500 - Internal server error if creation fails.
 */
router.post('/', async (req, res) => {
  try {
    const newCourse = await createCourse(req.body);
    res.status(201).json({
      id: newCourse.course_id,
      name: newCourse.course_name,
      code: newCourse.course_code,
      credits: newCourse.credits
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route PUT /courses/:id
 * @description Updates an existing course's details, prerequisites, and offerings.
 * @access Public
 *
 * @param {string} id - The internal course ID to update.
 *
 * @bodyParam {string} name - Updated course name.
 * @bodyParam {string} code - Updated course code.
 * @bodyParam {number} credits - Updated credit value.
 * @bodyParam {string} [prerequisites] - Comma-separated course codes for prerequisites.
 * @bodyParam {string} [offerings] - Comma-separated semester codes (e.g., "FA, SP").
 *
 * @response 200 - Returns the updated course object:
 *   {
 *     id: number,
 *     name: string,
 *     code: string,
 *     credits: number
 *   }
 * @response 400 - Invalid or missing course ID.
 * @response 500 - Internal server error if update fails.
 */
router.put('/:id', async (req, res) => {
  const courseId = req.params.id;
  if (!courseId || isNaN(courseId)) {
    return res.status(400).json({ message: 'Invalid or missing course ID' });
  }

  try {
    const updatedCourse = await updateCourse(courseId, req.body);
    res.json({
      id: updatedCourse.course_id,
      name: updatedCourse.course_name,
      code: updatedCourse.course_code,
      credits: updatedCourse.credits
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


/**
 * @route DELETE /courses/:id
 * @description Deletes a course by its internal ID.
 * @access Public
 *
 * @param {string} id - The internal course ID to delete.
 *
 * @response 200 - Confirmation message:
 *   { message: 'Course deleted successfully' }
 * @response 500 - Internal server error if deletion fails.
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteCourse(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
