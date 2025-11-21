import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';

/**
 * Protected route component that checks if the user is authenticated.
 * If authenticated, it renders the child components (Outlet).
 * If not authenticated, it redirects to the login page.
 *
 * @returns {JSX.Element} The protected route component.
 */
export default function ProtectedRoute({ allowedRoles }) {
    const { isAuthed, user } = useAuth();
    const location = useLocation();
    
    // Block access if not authenticated
    if (!isAuthed) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Check if user is allowed to access certain routes based on roles
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user?.role?.toLowerCase();
        const allowed = allowedRoles.map(r => r.toLowerCase());
        if (!allowed.includes(userRole)) {
            const fallbackPath = `/${userRole}/dashboard`;
            return <Navigate to={fallbackPath} replace />;
        }
    }

    return <Outlet />;
}