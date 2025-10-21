/**
 * File: frontend/src/components/DegreePlanComponents/RequirementsView.jsx
 * This file defines the RequirementsView component to display courses grouped by program requirements.
 */
import { useState, useEffect } from "react";

/**
 * Builds a hierarchy of requirements from a flat array.
 * @param {*} flatReqs - The flat array of requirements
 * @returns {*} - The hierarchical structure of requirements
 */
function buildHierarchy(flatReqs) {
    const map = new Map();
    const roots = [];

    // initialize all requirements with empty children array
    flatReqs.forEach(req => {
        map.set(req.requirement_id, { ...req, children: [], courses: [] });
    });

    // connect children to parent requirements
    flatReqs.forEach(req => {
        if (req.parent_requirement_id) {
            const parent = map.get(req.parent_requirement_id);
            if (parent) {
                parent.children.push(map.get(req.requirement_id));
            }
        } else {
            roots.push(map.get(req.requirement_id));
        }
    });

    return roots;
}

/**
 * Flattens a hierarchical requirement structure into a flat array.
 * @param {*} node - The current requirement node
 * @param {*} arr - The array to accumulate flattened requirements
 * @returns {*} - The flattened array of requirements
 */
function flattenHierarchy(node, arr = []) {
    if (!node.courses) node.courses = [];
    if (!node.children) node.children = [];
    arr.push(node);
    node.children.forEach(child => flattenHierarchy(child, arr));
    return arr;
}

/**
 * Calculates the total completed credits for a requirement and its children.
 * Recursively sums completed credits from courses and child requirements.
 * @param {*} req - The requirement object
 * @returns {number} - The total completed credits
 */
function calculateCompletedCredits(req) {
    let completedCredits = req.courses.reduce((sum, course) => {
        return sum + (course.course_status === 'Completed' ? (course.credits || 0) : 0);
    }, 0);

    req.children.forEach(child => {
        completedCredits += calculateCompletedCredits(child);
    });

    req.completedCredits = completedCredits;
    return completedCredits;
}

/**
 * RequirementsView component displays courses grouped by program requirements.
 * @param {*} courses - array of course objects to display
 * @returns {JSX.Element} - The rendered requirements view
 */
export default function RequirementsView( { courses, program, semesters=[], student } ) {
    const [localCourses, setLocalCourses] = useState(courses);
    const [editingCourse, setEditingCourse] = useState(null);
    const [newStatus, setNewStatus] = useState('Unplanned');
    const [semesterId, setSemesterId] = useState('');

    if (!courses || courses.length === 0) {
        return <p>No courses found</p>
    }

    if (!program?.program_type) {
        return <p>No program selected</p>;
    }

    // keep local copy of courses to trigger re-render on updates
    useEffect(() => {
        setLocalCourses(courses);
    }, [courses]);

    // Extract unique requirements from courses
    const uniqueReqs = Object.values(
        localCourses.reduce((acc, c) => {
            if (!acc[c.requirement_id]) {
                acc[c.requirement_id] = {
                    requirement_id: c.requirement_id,
                    req_description: c.req_description,
                    parent_requirement_id: c.parent_requirement_id,
                    parent_description: c.parent_description,
                    required_credits: c.required_credits,
                    requirement_type: c.requirement_type,
                }
            }
            return acc;
        }, {})
    )

    const hierarchy = buildHierarchy(uniqueReqs);

    // map courses to requirements in the hierarchy
    const flatReqsMap = hierarchy.flatMap(root => flattenHierarchy(root));
    const map = new Map(flatReqsMap.map(req => [req.requirement_id, req]));
    localCourses.forEach(course => {
        const node = map.get(course.requirement_id);
        if (node) node.courses.push(course);
    });

    // Helper to render status columns
    const renderEditableStatus = (course) => {
        const isEditing = editingCourse === course.course_id;

        if (isEditing) {
            const availableSemesters = course.semester_options;

            return (
                <td colSpan={3}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            {["Completed", "In Progress", "Planned", "Unplanned"].map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>

                        {newStatus === 'Planned' && (
                            <select
                                value={semesterId}
                                onChange={(e) => setSemesterId(Number(e.target.value))}
                            >
                                <option value="">Select Semester</option>
                                {availableSemesters.map(semester => (
                                    <option key={semester.semester_id} value={semester.semester_id}>
                                        {semester.semester_name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <button onClick={() => handleSaveStatus(course)}>Save</button>
                    <button onClick={() => setEditingCourse(null)}>Cancel</button>
                </td>
            );
        }

        return (
            <td
                colSpan={3}
                onClick={() => {
                    setEditingCourse(course.course_id);
                    setNewStatus(course.course_status || 'Unplanned');
                }}
            >
                {course.course_status || 'Unplanned'}
                {course.semester_name ? ` (${course.semester_name})` : '-'}
            </td>
        );
    }

    async function handleSaveStatus(course) {
        const schoolId = student.id;
        const chosenSemesterId = newStatus === 'Planned' ? semesterId || null : course.semester_id || null;

        if (newStatus === 'Planned' && !chosenSemesterId) {
            alert("Please select a semester for Planned courses.");
            return;
        }

        try {
            const res = await fetch(`/students/${schoolId}/degree-plan/course`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    courseId: course.course_id,
                    status: newStatus,
                    semesterId: chosenSemesterId,
                    programId: course.program_id
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Failed: ${res.status} - ${errText}`);
            }

            const updated = await res.json();
            console.log("Course status updated:", updated);

            setEditingCourse(null);

            setLocalCourses(prev =>
                prev.map(c =>
                    c.course_id === course.course_id
                        ? { ...c, course_status: newStatus, semester_id: chosenSemesterId, semester_name: semesters.find(s => s.semester_id === chosenSemesterId)?.semester_name || c.semester_name || '' }
                        : c
                )
            )

        } catch (error) {
            console.error("Error saving course status:", error);
            alert(`Could not update course status: ${error.message}`);
        }
    }

    hierarchy.forEach(req => calculateCompletedCredits(req));

    function renderRequirement(req, level = 0) {

        const completedReqCredits = req.completedCredits || 0;
        const requiredReqCredits = req.required_credits || 0;
        
        const rows = [];
        const rowStyle = { '--level': level };

        rows.push(
            <tr key={`req=${req.requirement_id}`} className={`req-row req-level-${level}`} style={rowStyle}>
                <td colSpan={program.program_type !== 'certificate' ? 9 : 8} className="requirement-header-cell">
                    <div className="requirement-header-content">
                        <strong>{req.req_description}</strong>
                        {requiredReqCredits > 0 && (
                            <span style={{ marginLeft: '20px' }}>{completedReqCredits} / {requiredReqCredits}</span>
                        )}
                    </div>
                </td>
            </tr>
        );

        if (req.courses?.length > 0) {
            req.courses
            .filter(course => course?.course_id)
            .forEach(course => {
                rows.push(
                    <tr key={`${req.requirement_id}-${course.course_id}`} className={`course-row course-status-${(course.course_status || 'unplanned').toLowerCase().replace(/\s/g, '-')}`} style={rowStyle}>
                        <td><strong>{course.course_code || '-'}</strong></td>
                        <td>{course.course_name || '-'}</td>
                        {program.program_type !== 'certificate' && (
                            <td>{course.certificate_overlaps && course.certificate_overlaps.length > 0 ? course.certificate_overlaps.map(co => co.certificate_short_name).join(', ') : 'None'}</td>
                        )}
                        <td>{course.prerequisites && course.prerequisites.length > 0 ? course.prerequisites.map(pr => pr.course_code).join(', ') : 'None'}</td>
                        <td>{course.offered_semesters || 'N/A'}</td>
                        <td>{course.credits || '-'}</td>
                        <td colSpan={3}>
                            {renderEditableStatus(course)}
                        </td>
                    </tr>
                );
            });
        }

        if (req.children?.length > 0) {
            req.children.forEach(child => {
                rows.push(...renderRequirement(child, level + 1));
            });
        }

        return rows;
    }

    return (
        <div className="requirements-view-container">
            <div className="requirements-view">
                <table className="requirements-table">
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
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hierarchy.map(req => renderRequirement(req))}
                    </tbody>
                </table>
            </div>
        </div>
        
    );
}