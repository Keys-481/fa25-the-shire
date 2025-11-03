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

// candidate fields on the authenticated user that might contain the school id
const candidateIdFields = useMemo(() => (user ? [
    user.public_id,
    user.publicId,
    user.school_student_id,
    user.schoolStudentId,
    user.id,
    user.user_id,
    user.studentId,
].filter(Boolean) : []), [user]);

    useEffect(() => {
        if (!user || candidateIdFields.length === 0) {
            setPrograms([]);
            setSelectedProgram(null);
            setStudent(null);
            return;
        }

        let cancelled = false;
        (async () => {
            // try each candidate id until we find programs for that student
            for (const candidate of candidateIdFields) {
                try {
                    const encoded = encodeURIComponent(String(candidate));
                    const res = await fetch(`/api/students/${encoded}/programs`, {
                        credentials: "same-origin",
                        headers: { "Accept": "application/json" },
                    });
                    if (!res.ok) {
                        // try the next candidate id
                        continue;
                    }
                    const data = await res.json();
                    const studentPrograms = data.programs || (data.programs === undefined && data.programs === null ? [] : data.programs) || [];

                    if (!cancelled) {
                        setPrograms(studentPrograms);
                        setSelectedProgram(studentPrograms.length > 0 ? studentPrograms[0] : null);

                        // build a minimal student object expected by ProgramSelector / DegreePlan
                        const name = user.name ?? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
                        setStudent({
                            id: String(candidate),
                            name: name || undefined,
                            email: user.email,
                            phone: user.phone ?? user.phone_number
                        });
                    }

                    // stop trying more candidates once we found a working one
                    break;
                } catch (err) {
                    // try next candidate
                    continue;
                }
            }

            // if no candidate returned programs, ensure state is cleared
            if (!cancelled && programs.length === 0) {
                // leave programs empty and student set to last candidate (if any) or null
                if (!student) {
                    setStudent(prev => prev ?? (candidateIdFields[0] ? {
                        id: String(candidateIdFields[0]),
                        name: user?.name ?? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim(),
                        email: user?.email,
                        phone: user?.phone ?? user?.phone_number
                    } : null));
                }
            }
        })();

        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, JSON.stringify(candidateIdFields)]);

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
