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
      const data = await apiClient.get("/graduation/graduation-report/");
      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (err) {
      console.error("fetchGraduationApplicants", err);
      setError("Failed to load graduation applicants");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // CSV Export Function
  const exportCSV = () => {
    if (!students.length) return;

    const headers = [
      "Student Name",
      "ID",
      "Program",
      "Status",
      "Application Date",
    ];

    const rows = students.map((s) => [
      `${s.first_name} ${s.last_name}`,
      s.school_student_id ?? s.student_id,
      s.program_name,
      s.status,
      s.status_updated_at
        ? new Date(s.status_updated_at).toLocaleDateString()
        : "-",
    ]);

    const csvContent =
      [headers, ...rows]
        .map((r) =>
          r
            .map((val) =>
              typeof val === "string" && val.includes(",")
                ? `"${val}"`
                : val
            )
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "graduation_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <p>Loading graduation applicants...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!students.length)
    return <p>No students have applied or been approved for graduation.</p>;

  return (
    <div>
      <button onClick={exportCSV} style={{ marginBottom: "10px", marginTop: "10px" }}>
        Download CSV
      </button>
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
              <td>
                {s.first_name} {s.last_name}
              </td>
              <td>{s.school_student_id ?? s.student_id}</td>
              <td>{s.program_name}</td>
              <td>{s.status}</td>
              <td>
                {s.status_updated_at
                  ? new Date(s.status_updated_at).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
