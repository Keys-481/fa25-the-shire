// File: frontend/src/pages/Accounting/AccountingGraduationReport.jsx
import AccountingNavBar from "../../components/NavBars/AccountingNavBar";
import GraduationReportLayout from "../../components/GradLayout";

/**
 * AccountingGraduationReport
 * Page to display the Graduation Report for accounting department
 */
export default function AccountingGraduationReport() {
  return (
    <div>
      <AccountingNavBar />
      <div className="window">
        <div className="title-bar">
          <h1>Graduation Report</h1>
        </div>

        <div className="container">
          <GraduationReportLayout />
        </div>
      </div>
    </div>
  );
}
