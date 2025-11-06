/**
 * File: frontend/src/pages/Notifications.jsx
 * Page component to display user notifications.
 */

import AccountingNavBar from '../components/NavBars/AccountingNavBar';
import AdminNavBar from '../components/NavBars/AdminNavBar';
import AdvisorNavBar from '../components/NavBars/AdvisorNavBar';
import StudentNavBar from '../components/NavBars/StudentNavBar';

import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useApiClient } from '../lib/apiClient';

export default function Notifications() {
    const { user } = useAuth();
    const api = useApiClient();

    const [notifications, setNotifications] = useState([]);

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

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await api.get(`/api/notifications`,
                    {
                        headers: {
                            'Cache-Control': 'no-cache',
                        }
                    }
                );
                setNotifications(data.notifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, [api]);

    return (
        <div>
            {NavBarComponent && <NavBarComponent />}
            <div className="window">
                <div className="title-bar">
                    <h1>Notifications</h1>
                </div>

                {/* Notifications List */}
                <div className="container">
                    <ul className="notif-list">
                        {notifications.length === 0 ? (
                            <li className="no-notifs">You have no notifications.</li>
                        ) : (
                            notifications.map((notif) => (
                                <li key={notif.notification_id} className={`notif-item ${notif.is_read ? 'read' : 'unread'}`}>
                                    <strong className="notif-title">{notif.title}</strong>
                                    <p className="notif-message">{notif.notif_message}</p>
                                    {notif.created_at && (
                                        <span className="notif-timestamp">
                                            {new Date(notif.created_at).toLocaleString()}
                                        </span>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    )
}