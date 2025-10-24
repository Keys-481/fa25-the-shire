/**
 * File: frontend/src/components/DegreePlanComponents/RequirementsView.jsx
 * This file defines the RequirementsView component to display courses grouped by program requirements.
 */
import { useState, useEffect } from "react";
import { PencilLine } from "lucide-react";

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
export default function RequirementsView( { courses, program, semesters=[], student, onCourseUpdated } ) {
    const [localCourses, setLocalCourses] = useState(courses);
    const [editingCourse, setEditingCourse] = useState(null);
    const [newStatus, setNewStatus] = useState('Unplanned');
    const [semesterId, setSemesterId] = useState('');

     // keep local copy of courses to trigger re-render on updates
    useEffect(() => {
        setLocalCourses(courses);
    }, [courses]);

    // when editingCourse changes, set initial values for status and semester
    useEffect(() => {
        if (editingCourse) {
            const course = localCourses.find(c => c.course_id === editingCourse);
            setSemesterId(course?.semester_id || '');
            setNewStatus(course?.course_status || 'Unplanned');
            console.log("Editing Course:", course);
            console.log("Initial Semester ID:", course?.semester_id);
        }
    }, [editingCourse, localCourses]);

    if (!courses || courses.length === 0) {
        return <p>No courses found</p>
    }

    if (!program?.program_type) {
        return <p>No program selected</p>;
    }

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

    // Handler to save updated course status from editing mode
    async function handleSaveStatus(course) {
        const schoolId = student.id;
        let chosenSemesterId = null;
        if (newStatus === 'Unplanned') {
            chosenSemesterId = null;
        } else if (["Completed", "In Progress", "Planned"].includes(newStatus)) {
            chosenSemesterId = semesterId ? Number(semesterId) : course.semester_id || null;
        }

        if (["Completed", "In Progress", "Planned"].includes(newStatus) && !chosenSemesterId) {
            alert(`Please select a semester for "${newStatus}" courses.`);
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
                    programId: program.program_id
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
                        ? { ...c,
                            course_status: updated.course_status,
                            semester_id: updated.semester_id ?? chosenSemesterId,
                            semester_name: semesters.find(s => s.semester_id === updated.semester_id)?.semester_name || c.semester_name}
                        : c
                )
            )

            if (typeof onCourseUpdated === 'function') {
                onCourseUpdated();
            }

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
                        {["Completed", "In Progress", "Planned"].map(status => (
                            <td key={status}>
                                {course.course_status === status ? (course.semester_name || '-') : '-'}
                            </td>
                        ))}

                        <td className="edit-cell-anchor">
                            <button
                            className={`course-status-edit-btn ${editingCourse === course.course_id ? 'active' : ''}`}
                            onClick={() => setEditingCourse(course.course_id)}
                            >
                            <PencilLine size={16} />
                            </button>
                        </td>
                    </tr>
                );

                if (editingCourse === course.course_id) {
                    rows.push(
                        <tr key={`${req.requirement_id}-${course.course_id}-edit-row`} className="course-edit-row">
                            <td colSpan={program.program_type !== 'certificate' ? 10: 9}>
                                <div>
                                    <label>Status:</label>
                                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                        {["Completed", "In Progress", "Planned", "Unplanned"].map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>

                                    {["Completed", "In Progress", "Planned"].includes(newStatus) && (
                                        <>
                                            <label>Semester:</label>
                                            <select value={semesterId} onChange={(e) => setSemesterId(e.target.value)}>
                                                <option value="">Select Semester</option>
                                                {course.semester_options.map(semester => (
                                                    <option key={semester.semester_id} value={String(semester.semester_id)}>
                                                        {semester.semester_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </>
                                    )}
                                    <button onClick={() => handleSaveStatus(course)}>Save</button>
                                    <button onClick={() => setEditingCourse(null)}>Cancel</button>
                                </div>
                            </td>
                        </tr>
                    )
                }
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
                            <th>Completed</th>
                            <th>In Progress</th>
                            <th>Planned</th>
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