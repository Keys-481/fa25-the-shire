/**
 * File: frontend/src/components/DegreePlanComponents/SemesterView.jsx
 * This file defines the SemesterView component to display courses grouped by semester.
 */


/**
 * The SemesterView component displays courses grouped by semester.
 * @param {*} courses - array of course objects to display
 * @returns {JSX.Element} - The rendered semester view
 */
export default function SemesterView( { courses, program } ) {
    if (!courses || courses.length === 0) {
        return <p>No courses found</p>;
    }

    if (!program?.program_type) {
        return <p>No program selected</p>;
    }

    const grouped = courses.reduce((acc, course) => {
        const key = course.semester_name || 'Unscheduled Courses';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(course);
        return acc;
    }, {});

    const sortedSemesters = Object.keys(grouped).sort();

    return (
        <div>
            {sortedSemesters.map((semester) => (
                <div key={semester} className="semester-section">
                    <h4>{semester}</h4>
                    <div className="table-horizontal-line"></div>

                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Title</th>
                                    {program.program_type !== 'certificate' && (
                                        <th>Certificate Overlap</th>
                                    )}
                                    <th>Prerequisites</th>
                                    <th>Offered</th>
                                    <th>Credits</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grouped[semester].map((course) => (
                                    <tr key={`${semester}-${course.course_id || course.course_code}`}>
                                        <td><strong>{course.course_code}</strong></td>
                                        <td>{course.course_name}</td>
                                        {program.program_type !== 'certificate' && (
                                            <td>N/A</td>
                                        )}
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