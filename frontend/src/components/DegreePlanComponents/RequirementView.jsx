/**
 * File: frontend/src/components/DegreePlanComponents/RequirementsView.jsx
 * This file defines the RequirementsView component to display courses grouped by program requirements.
 */
import { useState, useEffect } from "react";
import { buildHierarchy, flattenHierarchy, calculateCompletedCredits } from "./utils/requirementsHelpers";
import CourseEditRow from "./reqViewComps/CourseEditRow";
import CertificateAlert from "./reqViewComps/CertificateAlert";
import CourseRow from "./reqViewComps/CourseRow";

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
                    <CourseRow
                        key={`${req.requirement_id}-${course.course_id}`}
                        course={course}
                        program={program}
                        editingCourse={editingCourse}
                        setEditingCourse={setEditingCourse}
                        rowStyle={rowStyle}
                        requirementId={req.requirement_id}
                    />
                );

                if (editingCourse === course.course_id) {
                    rows.push(
                        <CourseEditRow
                            key={`${req.requirement_id}-${course.course_id}-edit-row`}
                            course={course}
                            program={program}
                            newStatus={newStatus}
                            semesterId={semesterId}
                            semesters={semesters}
                            onStatusChange={setNewStatus}
                            onSemesterChange={setSemesterId}
                            onSave={() => handleSaveStatus(course)}
                            onCancel={() => setEditingCourse(null)}
                        />
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
                <CertificateAlert program={program} courses={localCourses} />
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