/** 
 * File: frontend/src/pages/Student/DegreeTracking.jsx
 * Student Degree Tracking Page
 * This file allows students to view their degree progress and plans */


import { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthProvider";
import StudentNavBar from "../../components/NavBars/StudentNavBar";
import ProgramSelector from "../../components/ProgramSelector";
// use the auth provider to get current user

export default function StudentDegreeTracking() {
    const { user } = useAuth();
    const studentSchoolId = user?.school_student_id;

    // keep a local student object (we'll set it once we know which id works)
    const [student, setStudent] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(null);

    useEffect(() => {
        if (!studentSchoolId) return;

        const fetchPrograms = async () => {
            try {
                const response = await fetch(`/api/students/${studentSchoolId}/programs`);
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
    }, [studentSchoolId]);

    return (
        <div>
            <StudentNavBar />
            <div className="window">
                <div className="title-bar">
                    <h1>Degree Tracking</h1>
                </div>
                <div className="container">
                    <ProgramSelector
                        student={user} // Pass the logged-in student
                        programs={programs}
                        selectedStudentProgram={selectedProgram}
                        setSelectedProgram={setSelectedProgram}
                    />
                </div>
            </div>
        </div>
    );
}
