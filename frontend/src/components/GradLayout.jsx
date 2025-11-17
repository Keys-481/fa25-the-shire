// File: frontend/src/components/GraduationReportLayout.jsx
import { useEffect, useState } from "react";

/**
 * GraduationReportLayout
 * Fetches and displays students who have applied or been approved for graduation
 * in the next two semesters.
 */
export default function GraduationReportLayout() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate next two semesters
  const getNextTwoSemesters = () => {
    const terms = ["Spring", "Summer", "Fall"];
    const now = new Date();
    const month = now.getMonth(); // 0-indexed
    let termIndex;
    let year = now.getFullYear();

    if (month >= 8) {
      termIndex = 2; // Fall
    } else if (month >= 5) {
      termIndex = 1; // Summer
    } else {
      termIndex = 0; // Spring
    }

    const semesters = [];
    for (let i = 0; i < 2; i++) {
      const idx = (termIndex + i) % terms.length;
      const addYear = Math.floor((termIndex + i) / terms.length);
      semesters.push({ term: terms[idx], year: year + addYear });
    }
    return semesters;
  };

  useEffect(() => {
    fetchGraduationApplicants();
  }, []);

  const fetchGraduationApplicants = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("jwt"); // store token after login
    const res = await fetch("/api/students/graduation-applicants", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const nextTwoSemesters = getNextTwoSemesters();

      // Filter students by next two semesters
      const filtered = data.filter((s) => {
        if (!s.application_date) return false;
        const appDate = new Date(s.application_date);
        const appTerm = (() => {
          const month = appDate.getMonth();
          if (month >= 0 && month < 5) return "Spring";
          if (month >= 5 && month < 8) return "Summer";
          return "Fall";
        })();
        const appYear = appDate.getFullYear();
        return nextTwoSemesters.some(
          (sem) => sem.term === appTerm && sem.year === appYear
        );
      });

      setStudents(filtered);
    } catch (err) {
      console.error("Error fetching graduation applicants:", err);
      setError(err.message || "Error fetching students");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading graduation applicants...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!students.length)
    return <p>No students have applied or been approved for graduation in the next two semesters.</p>;

  return (
    <table className="requirements-table" style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Program</th>
          <th>Status</th>
          <th>Application Date</th>
          <th>ID</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s) => (
          <tr key={s.student_id}>
            <td>{s.first_name} {s.last_name}</td>
            <td>{s.program_name}</td>
            <td>{s.status}</td>
            <td>{s.application_date ? new Date(s.application_date).toLocaleDateString() : "-"}</td>
            <td>{s.student_id}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
