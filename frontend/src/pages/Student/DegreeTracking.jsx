/** 
 * File: frontend/src/pages/Student/DegreeTracking.jsx
 * Student Degree Tracking Page
 * This file allows students to view their degree progress and plans */


import { useState, useEffect, useMemo } from "react";
import StudentNavBar from "../../components/NavBars/StudentNavBar";
import ProgramSelector from "../../components/ProgramSelector";
import { useAuth } from "../../auth/AuthProvider.jsx"; // use the auth provider to get current user

export default function StudentDegreeTracking() {
    // get logged-in user
    const { user } = useAuth();

    // keep a local student object (we'll set it once we know which id works)
    const [student, setStudent] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(null);

    useEffect(() => {
        if (!user || !user.public_id) {
            setPrograms([]);
            setSelectedProgram(null);
            setStudent(null);
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const encoded = encodeURIComponent(user.public_id);
                const res = await fetch(`/api/students/${encoded}/programs`, {
                    credentials: "same-origin",
                    headers: { "Accept": "application/json" },
                });
                    if (!res.ok) {
                        console.error('Failed to fetch student programs');
                        return;
                    }

                    const data = await res.json();
                    const studentPrograms = data.programs || (data.programs === undefined && data.programs === null ? [] : data.programs) || [];

                    if (!cancelled) {
                        setPrograms(studentPrograms);
                        setSelectedProgram(studentPrograms.length > 0 ? studentPrograms[0] : null);

                        // build a minimal student object expected by ProgramSelector / DegreePlan
                        const name = user.name ?? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
                        setStudent({
                            id: String(user.public_id),
                            name: name || undefined,
                            email: user.email,
                            phone: user.phone ?? user.phone_number
                        });
                    }
                } catch (err) {
                    console.error('Error fetching student programs:', err);
                }
            }
        )();

        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    if (!user || !student) {
        return (
            <div>
                <StudentNavBar />
                <div className="window">
                    <div className="title-bar">
                        <h1>Degree Tracking</h1>
                    </div>
                    <div className="container">
                        <p>Please log in to view your degree tracking.</p>
                    </div>
                </div>
            </div>
        );
    }

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