// File: frontend/src/pages/Student/DegreeTracking.jsx
import { useEffect, useState } from "react";
import DegreePlan from "../../components/DegreePlanComponents/DegreePlan.jsx";
import ProgramSelector from "../../components/ProgramSelector.jsx";
import "../../styles/Styles.css";

export default function StudentDegreeTracking() {
  const [student, setStudent] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentId = 1; 
        const resStudent = await fetch(`/api/students/${studentId}`);
        if (!resStudent.ok) throw new Error("Student not found");
        const studentData = await resStudent.json();


        const resPrograms = await fetch(`/api/students/${studentId}/programs`);
        if (!resPrograms.ok) throw new Error("Programs not found");
        const programsData = await resPrograms.json();

        setStudent(studentData);
        setPrograms(programsData.programs || []);
        setSelectedProgram(programsData.programs?.[0] || null);
      } catch (err) {
        console.error("Error loading student data:", err);
      }
    };

    fetchStudentData();
  }, []);

  if (!student) return <p>Loading degree plan...</p>;

  return (
    <div className="student-degree-tracking-container">
      <h1>{student.name}'s Degree Plan</h1>

      <ProgramSelector
        student={student}
        programs={programs}
        selectedStudentProgram={selectedProgram}
        setSelectedProgram={setSelectedProgram}
      />

      {selectedProgram && (
        <DegreePlan
          student={student}
          program={selectedProgram}
          degreePlan={student.degreePlan || []}
        />
      )}
    </div>
  );
}
