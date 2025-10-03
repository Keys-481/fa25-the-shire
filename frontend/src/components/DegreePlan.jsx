/**
 * File: frontend/src/components/DegreePlan.jsx{
 * This file defines the DegreePlan component to display a student's degree plan.
 */

import { useEffect, useState } from "react";

/**
 * DegreePlan component displays the degree plan for a specific student.
 */
export default function DegreePlan({ student }) {
    const base_url = '/students';

    // state to hold degree plan data, loading, and error states
    const [planData, setPlanData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // helper function to group courses by semester
    const groupCoursesBySemester = (courses) => {
        if (!courses || courses.length === 0) return {};
        return courses.reduce((acc, course) => {
            const semesterKey = course.semester_name || 'Unscheduled Courses';
            if (!acc[semesterKey]) {
                acc[semesterKey] = [];
            }
            acc[semesterKey].push(course);
            return acc;
        }, {});
    }

    // function to render the degree plan
    // This function takes the degree plan data and returns the JSX to display it
    const renderDegreePlan = (planData) => {
        const courses = planData?.degreePlan;

        if (!courses?.degreePlan?.length == 0) {
            return <p>No courses found in degree plan.</p>;
        }

        const groupedPlan = groupCoursesBySemester(courses);
        const sortedSemesters = Object.keys(groupedPlan).sort();

        return (
            <div>
                {sortedSemesters.map((semester) => (
                    <div key={semester} className="semester-section">
                        {/* Semester Header */}
                        <h4>{semester}</h4>
                        <div className="table-horizontal-line"> </div>

                        { /* Courses List in Semester (Table format) */}
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Course Code</th>
                                        <th>Course Title</th>
                                        <th>Certificate Overlap</th>
                                        <th>Prerequisites</th>
                                        <th>Offered</th>
                                        <th>Credits</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedPlan[semester].map((course) => (
                                        <tr key={course.course_id}>
                                            <td><strong>{course.course_code}</strong></td>
                                            <td>{course.course_name}</td>
                                            <td>N/A</td>
                                            <td>{course.prerequisites && course.prerequisites.length > 0 ? course.prerequisites.map(pr => pr.course_code).join(', ') : 'None'}</td>
                                            <td>{course.offered_semesters || 'N/A'}</td>
                                            <td>{course.credits}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // function to fetch degree plan data
    useEffect(() => {
        const fetchDegreePlan = async () => {
            setLoading(true);
            setError(null);

            // get degree plan data from backend
            try {
                const response = await fetch(`${base_url}/${student.id}/degree-plan`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch degree plan: ${response.status}`);
                }

                const data = await response.json();
                setPlanData(data);
            } catch (error) {
                console.error('Error fetching degree plan:', error);
                setError(error.message);
                setPlanData(null);
            } finally {
                setLoading(false);
            }
        };

        // Fetch degree plan only if student ID is available
        if (student?.id) {
            fetchDegreePlan();
        }
    }, [student.id]);

    // render loading state, error, or degree plan
    if (loading) {
        return <p>Loading degree plan...</p>;
    }

    if (error) {
        return <p className="error-message">Error: {error}</p>;
    }

    if (!planData?.degreePlan?.length) {
        return <p>Degree plan not found for {student.name}</p>;
    }

    // display student info
    const { name, id, email, phone, program } = student;

    return (
        <div className="degree-plan-container">
            {/* Student Info Section */}
            <div className="degree-plan-header">
                <div className="header-row">
                    <h3>
                        <span>Name:</span> {name}
                    </h3>
                    <h3>
                        <span>ID:</span> {id}
                    </h3>
                </div>
                <p>
                    <span>Email:</span> {email}
                    <span className="degree-plan-content">|</span>
                    <span>Phone:</span> {phone}
                </p>
                <p><span>Program:</span> {program}</p>

            </div>

            {/* Degree Plan Section */}
            <div className="degree-plan-content">
                {renderDegreePlan(planData)}
            </div>
        </div>
    )
}
