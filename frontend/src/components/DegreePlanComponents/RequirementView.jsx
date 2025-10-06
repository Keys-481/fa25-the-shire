/**
 * File: frontend/src/components/DegreePlanComponents/RequirementsView.jsx
 * This file defines the RequirementsView component to display courses grouped by program requirements.
 */

/**
 * RequirementsView component displays courses grouped by program requirements.
 * @param {*} courses - array of course objects to display
 * @returns {JSX.Element} - The rendered requirements view
 */
export default function RequirementsView( { courses } ) {
    if (!courses || courses.length === 0) {
        return <p>No courses found</p>
    }

    const coursesByRequirement = courses.reduce((acc, course) => {
        const key = course.requirement_label
            || course.req_description
            || course.requirement_type
            || 'Uncategorized';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(course);
        return acc;
    }, {});

    const sortedRequirements = Object.keys(coursesByRequirement).sort();

    const renderStatus = (course, targetStatus) => {
        if (course.course_status === targetStatus) {
            return course.semester_name || "-";
        }
        return "";
    }

    return (
        <div>
            {sortedRequirements.map((requirement) => (
                <div key={requirement} className="requirement-section">
                    <h4>{requirement.replace('_', ' ').toUpperCase()}</h4>
                    <div className="table-horizontal-line"></div>

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
                                    <th>Completed</th>
                                    <th>In Progress</th>
                                    <th>Planned</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coursesByRequirement[requirement].map((course) => (
                                    <tr key={`${requirement}-${course.course_id}`}>
                                        <td><strong>{course.course_code || '-'}</strong></td>
                                        <td>{course.course_name || '-'}</td>
                                        <td>N/A</td>
                                        <td>{course.prerequisites && course.prerequisites.length > 0 ? course.prerequisites.map(pr => pr.course_code).join(', ') : 'None'}</td>
                                        <td>{course.offered_semesters || 'N/A'}</td>
                                        <td>{course.credits || '-'}</td>
                                        <td>{renderStatus(course, 'Completed')}</td>
                                        <td>{renderStatus(course, 'In Progress')}</td>
                                        <td>{renderStatus(course, 'Planned')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}