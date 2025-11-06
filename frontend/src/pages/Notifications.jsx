/**
 * File: frontend/src/pages/Notifications.jsx
 * Page component to display user notifications.
 */

import AccountingNavBar from '../components/NavBars/AccountingNavBar';
import AdminNavBar from '../components/NavBars/AdminNavBar';
import AdvisorNavBar from '../components/NavBars/AdvisorNavBar';
import StudentNavBar from '../components/NavBars/StudentNavBar';

import { useAuth } from '../auth/AuthProvider';
import { useApiClient } from '../lib/apiClient';

export default function Notifications() {
    const { user } = useAuth();
    const api = useApiClient();

    let NavBarComponent = null;
    if (user?.role === 'advisor') {
        NavBarComponent = AdvisorNavBar;
    } else if (user?.role === 'accounting') {
        NavBarComponent = AccountingNavBar;
    } else if (user?.role === 'student') {
        NavBarComponent = StudentNavBar;
    } else if (user?.role === 'admin') {
        NavBarComponent = AdminNavBar;
    }


    return (
        <div>
            {NavBarComponent && <NavBarComponent />}
            <div className="window">
                <div className="title-bar">
                    <h1>Notifications</h1>
                </div>
            </div>
        </div>
    )
}