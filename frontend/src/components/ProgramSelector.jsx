/**
 * File: frontend/src/components/ProgramSelector.jsx
 * This file defines the ProgramSelector component to select a program for a student.
 */

import CommentsContainer from "./CommentComps/CommentsContainer";
import DegreePlan from "./DegreePlanComponents/DegreePlan";

export default function ProgramSelector({ student, programs, selectedStudentProgram, setSelectedProgram, userIsStudent=false }) {
    if (!student) {
        return <p className="p2">No student selected</p>;
    }

    return (
        <div className={`program-selector-wrapper ${userIsStudent ? 'student-layout' : 'advisor-layout'}`}>
            <div className="program-selector">
                <h3 style={{ margin: '15px' }}>Select Program:</h3>
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
                    <DegreePlan
                        student={student}
                        program={selectedStudentProgram}
                        userIsStudent={userIsStudent}
                    />
                    <CommentsContainer
                        student={student}
                        studentSchoolId={student.id}
                        programId={selectedStudentProgram.program_id}
                        userIsStudent={userIsStudent}
                    />
                </div>
            ) : (
                <p>Select a program to view the degree plan</p>
            )}
        </div>
    )
}
