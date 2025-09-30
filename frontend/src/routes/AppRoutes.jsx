/**
 * AppRoutes component defines all the route mappings for the application.
 * It uses React Router to handle navigation between different role-based pages.
 *
 * @component
 * @returns {JSX.Element} A router configuration with defined routes for Admin, Student, Advisor, and Accounting roles
 */

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
//login import
import PlaceHolder_LogIn from '../pages/LogIn/PlaceHolder_LogIn'
//admin imports
import AdminCourses from '../pages/Admin/Courses'
import AdminDashboard from '../pages/Admin/Dashboard'
import AdminSettings from '../pages/Admin/Settings'
import AdminUsers from '../pages/Admin/Users'
//student imports
import StudentDashboard from '../pages/Student/Dashboard'
import StudentSettings from '../pages/Student/Settings'
import StudentDegreeTracking from '../pages/Student/DegreeTracking'
//advisor imports
import AdvisorDashboard from '../pages/Advisor/Dashboard'
import Advising from '../pages/Advisor/Advising'
import AdvisorReportingFunctionality from '../pages/Advisor/ReportingFunctionality'
import AdvisorSettings from '../pages/Advisor/Settings' 


export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Replace to navigate to the dashboard based on permissions */}
        <Route path="/" element={<PlaceHolder_LogIn />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* Advising Routes */}
        <Route path="/advisor/dashboard" element={<AdvisorDashboard />} />
        <Route path="/advisor/advising" element={<Advising />} />
        <Route path="/advisor/reporting-functionality" element={<AdvisorReportingFunctionality />} />
        <Route path="/advisor/settings" element={<AdvisorSettings />} />
        
        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/degree-tracking" element={<StudentDegreeTracking />} />
        <Route path="/student/settings" element={<StudentSettings />} />

        {/* Accounting Routes */}

      </Routes>
    </Router>
  )
}