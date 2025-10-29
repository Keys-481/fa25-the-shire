/**
 * File: frontend/src/components/DegreePlan.jsx{
 * This file defines the DegreePlan component to display a student's degree plan.
 */

import { useEffect, useMemo, useState } from "react";
import SemesterView from "./SemesterView";
import RequirementsView from "./RequirementView";
import { useApiClient } from "../../lib/apiClient";

/**
 * DegreePlan component displays the degree plan for a specific student.
 */
export default function DegreePlan({ student, program, studentId: propStudentId, programId: propProgramId }) {
    const api = useApiClient();
    const base_url = '/api/students';

    const studentId = useMemo(() => student?.id ?? propStudentId ?? null, [student, propStudentId]);
    const thisProgramId = useMemo(() => {
        if (program?.program_id) return program.program_id;
        if (program?.programId) return program.programId;
        return propProgramId ?? null;
    }, [program, propProgramId]);

    // state to hold degree plan data, loading, and error states
    const [planData, setPlanData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // state toggle view type (by semester or by program requirements)
    const [viewType, setViewType] = useState('requirements'); // 'requirements' or 'semester'

    // function to fetch degree plan data when student or program changes
    useEffect(() => {
        if (!studentId || !thisProgramId || !viewType) return;

        (async () => {
            setLoading(true);
            setError('');
            try {
                const data = await api.get(
                    `${base_url}/${encodeURIComponent(studentId)}/degree-plan?programId=${encodeURIComponent(thisProgramId)}&viewType=${encodeURIComponent(viewType)}`
                );
                setPlanData(data);
            } catch (error) {
                console.error("[DegreePlan] fetch failed:", error?.message || error);
                setPlanData(null);
                setError(error?.message || "Failed to load degree plan");
            } finally {
                setLoading(false);
            }
        })();
    }, [studentId, thisProgramId, viewType, api]);
        
    if (!studentId || !thisProgramId) {
        return <p className="error-message">Select a student and a program to view the degree plan.</p>;
    }

    if (loading) return <p>Loading degree plan...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;

    const courses = planData?.degreePlan ?? [];
    if (!courses.length) return <p>Degree plan not found for {student?.name ?? studentId}</p>;

    const name = student?.name ?? "";
    const id = studentId;
    const email = student?.email ?? "";
    const phone = student?.phone ?? "";
    const programName = program?.program_name ?? program?.name ?? thisProgramId;

    const catalogYear = courses.find(c => c.catalog_year)?.catalog_year || 'N/A';
    const totalCredits = planData?.totalRequiredCredits ?? 0;
    const completedCredits = courses.reduce((sum, c) => sum + (c.course_status === "Completed" ? (c.credits || 0) : 0), 0);

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
                    <h3>
                        <span>Catalog Year:</span> {catalogYear}
                    </h3>
                </div>
                <p>
                    <span>Email:</span> {email}
                    <span className="degree-plan-content">|</span>
                    <span>Phone:</span> {phone}
                </p>
                <p><span>Program:</span> {programName}</p>

                {/* View Toggle */}
                <div className="view-toggle">
                    <div>
                        <button onClick={() => { setViewType('requirements') }} className={viewType === 'requirements' ? 'active' : 'inactive'}>
                            Requirements View
                        </button>
                        <button onClick={() => { setViewType('semester') }} className={viewType === 'semester' ? 'active' : 'inactive'}>
                            Semester View
                        </button>
                    </div>
                    <span className="degree-plan-content" style={{ marginLeft: '20px' }}>
                        <strong>Credit Count:</strong> {completedCredits} / {totalCredits}
                    </span>
                </div>
            </div>

            {/* Degree Plan Section */}
            <div className="degree-plan-content">
                {viewType === 'requirements' ? (
                    <RequirementsView courses={courses} program={program} />
                ) : (
                    <SemesterView courses={courses} program={program} />
                )}
            </div>
        </div>
    )
}
