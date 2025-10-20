/**
 * File: frontend/src/components/DegreePlan.jsx{
 * This file defines the DegreePlan component to display a student's degree plan.
 */

import { useEffect, useState } from "react";
import SemesterView from "./SemesterView";
import RequirementsView from "./RequirementView";

/**
 * DegreePlan component displays the degree plan for a specific student.
 */
export default function DegreePlan({ student, program }) {
    const base_url = '/api/students';

    // state to hold degree plan data, loading, and error states
    const [planData, setPlanData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // state toggle view type (by semester or by program requirements)
    const [viewType, setViewType] = useState('requirements'); // 'requirements' or 'semester'

    useEffect(() => {
        console.log("Student:", student);
        console.log("Program:", program);
    }, [student, program]);

    // function to fetch degree plan data when student or program changes
    useEffect(() => {
        if (!student?.id || !program?.program_id || !viewType) return;
        const fetchDegreePlan = async () => {
            setLoading(true);
            setError(null);

            // get degree plan data from backend
            try {
                console.log(`Fetching degree plan for student ID ${student.id} and program ID ${program.program_id}`);
                const response = await fetch(`${base_url}/${student.id}/degree-plan?programId=${program.program_id}&viewType=${viewType}`);

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
        if (student?.id && program?.program_id) {
            fetchDegreePlan();
        }
    }, [student?.id, program?.program_id, viewType]);

    // render loading state, error, or degree plan
    if (loading) return <p>Loading degree plan...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!planData?.degreePlan?.length) return <p>Degree plan not found for {student.name}</p>;

    // display student info
    const { name, id, email, phone } = student;
    const catalogYear = planData.degreePlan.find(c => c.catalog_year)?.catalog_year || 'N/A';

    // Sum total required credits from planData
    const totalCredits = planData.totalRequiredCredits;

    // sum total completed credits from planData
    const completedCredits = planData.degreePlan.reduce((sum, course) => {
        const isCompleted = course.course_status === 'Completed';
        return sum + (isCompleted ? (course.credits || 0) : 0);
    }, 0);

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
                <p><span>Program:</span> {program.program_name}</p>

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
                    <RequirementsView courses={planData.degreePlan} program={program} />
                ) : (
                    <SemesterView courses={planData.degreePlan} program={program} />
                )}
            </div>
        </div>
    )
}
