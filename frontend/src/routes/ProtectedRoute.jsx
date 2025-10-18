import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';

/**
 * Protected route component that checks if the user is authenticated.
 * If authenticated, it renders the child components (Outlet).
 * If not authenticated, it redirects to the login page.
 *
 * @returns {JSX.Element} The protected route component.
 */
export default function ProtectedRoute() {
    const { isAuthed } = useAuth();
    const location = useLocation();
    return isAuthed ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}