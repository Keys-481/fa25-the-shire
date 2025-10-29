/**
 * File: backend/tests/models/CourseModel.test.js
 * Unit tests for CourseModel.js using Jest
 * Tests assume certain values in seed data, if seed data changes, tests may need to be updated
 */

const CourseModel = require('../../src/models/CourseModel');
const { runSchemaAndSeeds } = require('../../db_setup');
const pool = require('../../src/db');
const { getPrerequisitesForCourse, getCourseOfferings, createCourse, updateCourse, deleteCourse } = require('../../src/models/CourseModel');

// Reset and seed the database before each test
beforeAll(async () => {
    await runSchemaAndSeeds();
});

// Close the database connection after all tests
afterAll(async () => {
    await pool.end();
});

/**
 * Tests for CourseModel
 */
describe('CourseModel', () => {

    // Test for getting prerequisites for a valid course ID
    // course with course_id 7 should have prerequisites in seed data (update as needed)
    test('getPrerequisitesForCourse returns prerequisites if exists', async () => {
        const courseId = 7; // should match your seed data
        const prerequisites = await CourseModel.getPrerequisitesForCourse(courseId);
        expect(prerequisites).toBeDefined();
        expect(Array.isArray(prerequisites)).toBe(true);
        expect(prerequisites.length).toBeGreaterThan(0);
    });

    // Test for getting prerequisites for a course with no prerequisites
    // course with course_id 1 should have no prerequisites in seed data (update as needed)
    test('getPrerequisitesForCourse returns empty array if no prerequisites', async () => {
        const courseId = 1; // assuming course_id 1 has no prerequisites in seed data
        const prerequisites = await CourseModel.getPrerequisitesForCourse(courseId);
        expect(prerequisites).toBeDefined();
        expect(Array.isArray(prerequisites)).toBe(true);
        expect(prerequisites.length).toBe(0);
    });

    // Test for getting prerequisites for an invalid course ID
    test('getPrerequisitesForCourse returns empty array for non-existent course', async () => {
        const prerequisites = await CourseModel.getPrerequisitesForCourse(9999); // assuming 9999 does not exist
        expect(prerequisites).toBeDefined();
        expect(Array.isArray(prerequisites)).toBe(true);
        expect(prerequisites.length).toBe(0);
    });

    // Test for getting course offerings for a valid course ID
    test('getCourseOfferings returns offerings if exists', async () => {
        const courseId = 1;
        const offerings = await CourseModel.getCourseOfferings(courseId);
        expect(offerings).toBeDefined();
        // model should return a string of semester types (e.g. "F, SP")
        expect(typeof offerings).toBe('string');
        expect(offerings.length).toBeGreaterThan(0);
    });

    // Test for getting certificate overlaps for a valid course ID
    test('getCertificateOverlaps returns certificates if exists', async () => {
        const courseId = 1; // course_id 1 = OPWL-536 in seed data
        const certificates = await CourseModel.getCertificateOverlaps(courseId);
        expect(certificates).toBeDefined();
        expect(Array.isArray(certificates)).toBe(true);
        expect(certificates.length).toBeGreaterThan(0);
        expect(certificates[0]).toHaveProperty('certificate_name', 'Graduate Certificate in Organizational Development (OD)');
    });

    // Partial or full course code queries return expected matches
    test('searchCourses returns correct course by code', async () => {
        const results = await CourseModel.searchCourses({ code: 'OPWL-536' });
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);
        expect(results[0]).toHaveProperty('course_code', 'OPWL-536');
    });

    // Partial name matches work as expected
    test('searchCourses returns correct course by name', async () => {
        const results = await CourseModel.searchCourses({ name: 'Portfolio' });
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].course_name).toMatch(/Portfolio/i);
    });

    // Irrelevant queries return no results
    test('searchCourses returns empty array for unknown course', async () => {
        const results = await CourseModel.searchCourses({ name: 'Nonexistent Course' });
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBe(0);
    });

    // Verifies that combined filtering works as expcected
    test('searchCourses returns correct course by name and code', async () => {
        const results = await CourseModel.searchCourses({ name: 'Organizational', code: 'OPWL-536' });
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].course_code).toBe('OPWL-536');
    });
});

/**
 * Tests for CourseModel (createCourse)
 */
describe('CourseModel - createCourse', () => {
  test('creates a course with offerings and prerequisites', async () => {
    // Create a new course with specified name, code, credits, prerequisites, and offerings
    const course = await createCourse({
      name: 'Model Test Course',
      code: 'MOD101',
      credits: 3,
      prerequisites: 'OPWL-536',
      offerings: 'FA, SP'
    });

    // Verify that the returned course object has correct basic properties
    expect(course.course_name).toBe('Model Test Course');
    expect(course.course_code).toBe('MOD101');
    expect(course.credits).toBe(3);

    // Check that the course offerings were correctly saved
    const offerings = await getCourseOfferings(course.course_id);
    expect(offerings).toContain('FA');
    expect(offerings).toContain('SP');

    // Check that the prerequisite course was corrctly linked
    const prereqs = await getPrerequisitesForCourse(course.course_id);
    expect(Array.isArray(prereqs)).toBe(true);
    expect(prereqs.length).toBeGreaterThan(0);
    expect(prereqs[0]).toHaveProperty('course_code', 'OPWL-536');

    // Clean up by deleting the test course
    deleteCourse(course.course_id);
  });
});

/**
 * Tests for CourseModel (updateCourse)
 */
describe('CourseModel - updateCourse', () => {
  test('updates course details, offerings, and prerequisites', async () => {
    // Create a temporary course to be updated
    const course = await createCourse({
      name: 'Update Target',
      code: 'UPD102',
      credits: 2,
      prerequisites: '',
      offerings: 'FA'
    });

    // Update the course with new name, credits, prerequisites, and offerings
    const updated = await updateCourse(course.course_id, {
      name: 'Updated Model Course',
      code: 'UPD102',
      credits: 4,
      prerequisites: 'OPWL-536',
      offerings: 'SP'
    });

    // Validate that the course details were updated correctly
    expect(updated.course_name).toBe('Updated Model Course');
    expect(updated.credits).toBe(4);

    // Ensure the offerings were updated (FA removed, SP added)
    const offerings = await getCourseOfferings(course.course_id);
    expect(offerings).toContain('SP');
    expect(offerings).not.toContain('FA');

    // Ensure the new prerequisite was correclty linked
    const prereqs = await getPrerequisitesForCourse(course.course_id);
    expect(prereqs.length).toBeGreaterThan(0);
    expect(prereqs[0].course_code).toBe('OPWL-536');

    // Clean up by deleting the test course
    deleteCourse(course.course_id);
  });
});

/**
 * Tests for CourseModel (deleteCourse)
 */
describe('CourseModel - deleteCourse', () => {
  test('deletes a course by ID', async () => {
    // Create a temporary course to be deleted
    const course = await createCourse({
      name: 'Delete Target',
      code: 'DEL102',
      credits: 1,
      prerequisites: '',
      offerings: ''
    });

    // Delete the course and verify the success message
    const result = await deleteCourse(course.course_id);
    expect(result.message).toBe('Course deleted successfully');

    // Confirm that the course no loger exists in the database
    const res = await pool.query('SELECT * FROM courses WHERE course_id = $1', [course.course_id]);
    expect(res.rows.length).toBe(0);
  });
});

/**
 * Tests for CourseModel (getEnrollments)
 */
describe('CourseModel - getEnrollments', () => {
  test('retrieves enrollment counts for a course across semesters', async () => {
    // Use a course code known to have enrollments in the seed data
    const courseCode = 'OPWL-536'; // course with known enrollments in seed data
    const enrollments = await CourseModel.getEnrollments(courseCode);

    // Validate the structure and content of the enrollment data
    expect(enrollments).toBeDefined();
    expect(Array.isArray(enrollments)).toBe(true); -
    expect(enrollments.length).toBeGreaterThan(0);
    expect(enrollments[0]).toHaveProperty('semester');
    expect(enrollments[0]).toHaveProperty('count');
  });

  test('returns empty array if the course has no enrollments', async () => {
  const courseCode = 'NONEXISTENT-COURSE';
  const enrollments = await CourseModel.getEnrollments(courseCode);

  expect(enrollments).toBeDefined();
  expect(Array.isArray(enrollments)).toBe(true);
  expect(enrollments.length).toBe(0);
});
});

/**
 * Tests for CourseModel (getEnrollments)
 * Course that has known enrollments
 */
describe('CourseModel - getEnrollments', () => {
  test('retrieves enrollment counts for a course across semesters', async () => {
    // Use a course code known to have enrollments in the seed data
    const courseCode = 'OPWL-506'; // course with known enrollments in seed data
    const enrollments = await CourseModel.getEnrollments(courseCode);

    // Validate the structure and content of the enrollment data
    expect(enrollments).toBeDefined();
    expect(Array.isArray(enrollments)).toBe(true); -
    expect(enrollments.length).toBeGreaterThan(0);
    expect(enrollments[0]).toHaveProperty('semester');
    expect(enrollments[0]).toHaveProperty('count');
  });

  test('returns empty array if the course has no enrollments', async () => {
  const courseCode = 'NONEXISTENT-COURSE';
  const enrollments = await CourseModel.getEnrollments(courseCode);

  expect(enrollments).toBeDefined();
  expect(Array.isArray(enrollments)).toBe(true);
  expect(enrollments.length).toBe(0);
});
});
