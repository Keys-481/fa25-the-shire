/**
 * AppRoutes component defines all the route mappings for the application.
 * It uses React Router to handle navigation between different role-based pages.
 *
 * @component
 * @returns {JSX.Element} A router configuration with defined routes for Admin, Student, Advisor, and Accounting roles
 */

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import AdminCourses from '../pages/Admin/Courses'
import AdminDashboard from '../pages/Admin/Dashboard'
import AdminSettings from '../pages/Admin/Settings'
import AdminUsers from '../pages/Admin/Users'

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Replace to navigate to the dashboard based on permissions */}
        <Route path="/" element={<AdminDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* Advising Routes */}

        {/* Student Routes */}

        {/* Accounting Routes */}

      </Routes>
    </Router>
  )
}