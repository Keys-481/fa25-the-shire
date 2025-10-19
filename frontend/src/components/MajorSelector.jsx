/**
 * File: frontend/src/components/ProgramSelector.jsx
 * This file defines the ProgramSelector component to select a program for a student.
 */

import MajorPlan from "./DegreePlanComponents/MajorPlan";

export default function MajorSelector({ course, programs, selectedCourse, setSelectedProgram }) {
    if (!course) {
        return <p className="p2">No course selected</p>;
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
                                className={`result-item ${selectedCourse?.program_id === program.program_id ? 'selected' : ''}`}
                            >
                                <strong>{program.program_name}</strong>
                                <br />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No programs found for this course</p>
                )}
            </div>
            {/* not quite right yet */}
            {selectedCourse ? (
                <MajorPlan course={course} program={selectedCourse} />
            ) : (
                <p>Select a program to view the degree plan</p>
            )}
        </>
    )
}
