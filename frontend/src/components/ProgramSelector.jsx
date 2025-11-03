/**
 * File: frontend/src/components/ProgramSelector.jsx
 * This file defines the ProgramSelector component to select a program for a student.
 */

import DegreePlan from "./DegreePlanComponents/DegreePlan";
import CommentsContainer from "./DegreePlanComponents/CommentsContainer";

export default function ProgramSelector({ student, programs, selectedStudentProgram, setSelectedProgram }) {
    if (!student) {
        return <p className="p2">No student selected</p>;
    }

    return (
        <>
            <div className="program-selector">
                <h3>Select Program:</h3>
                {programs.length > 0 ? (
                    <ul className="results-list">
                        {programs.map((program, index) => (
                            <li
                                key={index}
                                onClick={() => setSelectedProgram(program)}
                                className={`result-item ${selectedStudentProgram?.program_id === program.program_id ? 'selected' : ''}`}
                            >
                                <strong>{program.program_name}</strong>
                                <br />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No programs found for this student</p>
                )}
            </div>

            {selectedStudentProgram ? (
                <div className="degree-plan-comments-wrapper">
                    <div style={{ flex: 7 }}>
                        <DegreePlan student={student} program={selectedStudentProgram} />
                    </div>
                    <div style={{ flex: 3 }}>
                        <CommentsContainer
                            studentSchoolId={student.id}
                            programId={selectedStudentProgram.program_id}
                        />
                    </div>
                </div>
            ) : (
                <p>Select a program to view the degree plan</p>
            )}
        </>
    )
}
