import { useEffect, useState } from "react";
import { useApiClient } from "../lib/apiClient";

/**
 * GraduationReportLayout
 * Fetches and displays students who have applied or been approved for graduation.
 */
export default function GraduationReportLayout() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiClient = useApiClient();

  useEffect(() => {
    fetchGraduationApplicants();
  }, []);

  
const fetchGraduationApplicants = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await apiClient.get('/graduation');
    setStudents(Array.isArray(data.students) ? data.students : []);
  } catch (err) {
    console.error('fetchGraduationApplicants', err);
    setError('Failed to load graduation applicants');
    setStudents([]);
  } finally {
    setLoading(false);
  }
};

  if (loading) return <p>Loading graduation applicants...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!students.length)
    return <p>No students have applied or been approved for graduation.</p>;

  return (
    <table
      className="requirements-table"
      style={{ width: "100%", borderCollapse: "collapse" }}
    >
      <thead>
        <tr>
          <th>Student Name</th>
          <th>ID</th>
          <th>Program</th>
          <th>Status</th>
          <th>Application Date</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s) => (
          <tr key={s.student_id}>
            <td>{s.first_name} {s.last_name}</td>
            <td>{s.school_student_id ?? s.student_id}</td>
            <td>{s.program_name}</td>
            <td>{s.status}</td>
            <td>{s.status_updated_at ? new Date(s.status_updated_at).toLocaleDateString() : "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
