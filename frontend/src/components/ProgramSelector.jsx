/**
 * File: frontend/src/components/ProgramSelector.jsx
 * This file defines the ProgramSelector component to select a program for a student.
 */

import DegreePlan from "./DegreePlanComponents/DegreePlan";

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
                <DegreePlan student={student} program={selectedStudentProgram} />
            ) : (
                <p>Select a program to view the degree plan</p>
            )}
        </>
    )
}
