import { useState, useEffect } from "react";
import StudentNavBar from "../../components/NavBars/StudentNavBar";
import ProgramSelector from "../../components/ProgramSelector";

export default function StudentDegreeTracking() {
    // Hardcoded single student (use the correct school_student_id)
    const student = { id: "112299690", name: "Alice Johnson" };  // Hardccoded to alice for now as a placeholder student. Will update when we have log in functionality.

    const [programs, setPrograms] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(null);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const response = await fetch(`/students/${student.id}/programs`);
                if (!response.ok) {
                    console.error("Failed to fetch programs:", response.statusText);
                    setPrograms([]);
                    return;
                }

                const data = await response.json();

                // Ensure programs array exists
                const studentPrograms = data.programs || [];
                setPrograms(studentPrograms);

                // Auto-select the first program if available
                if (studentPrograms.length > 0) {
                    setSelectedProgram(studentPrograms[0]);
                }
            } catch (error) {
                console.error("Error fetching student programs:", error);
                setPrograms([]);
            }
        };

        fetchPrograms();
    }, [student.id]);

    return (
        <div>
            <StudentNavBar />
            <div className="window">
                <div className="title-bar">
                    <h1>Degree Tracking</h1>
                </div>
                <div className="container">
                    <ProgramSelector
                        student={student}
                        programs={programs}
                        selectedStudentProgram={selectedProgram}
                        setSelectedProgram={setSelectedProgram}
                    />
                </div>
            </div>
        </div>
    );
}