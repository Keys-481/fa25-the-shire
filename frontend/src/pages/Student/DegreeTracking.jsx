/** 
 * File: frontend/src/pages/Student/DegreeTracking.jsx
 * Student Degree Tracking Page
 * This file allows students to view their degree progress and plans */


import { useState, useEffect } from "react";
import StudentNavBar from "../../components/NavBars/StudentNavBar";
import ProgramSelector from "../../components/ProgramSelector";

export default function StudentDegreeTracking() {
    // Hardcoded single student 
    const student = { id: "112299690", name: "Alice Johnson", email: "student1@u.boisestate.edu", phone: "555-222-3333" };  
    // Hardccoded to alice for now as a placeholder student. Will update when we have log in functionality.

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

                const studentPrograms = data.programs || [];
                setPrograms(studentPrograms);

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
                        student={student} // Pass the hardcoded student object
                        programs={programs} // List of programs fetched from the server
                        selectedStudentProgram={selectedProgram}
                        setSelectedProgram={setSelectedProgram}
                    />
                </div>
            </div>
        </div>
    );
}