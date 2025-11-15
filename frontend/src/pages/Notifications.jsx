/**
 * File: frontend/src/pages/Notifications.jsx
 * Page component to display user notifications.
 */

import { Mail, MailOpen, Trash } from 'lucide-react';
import AccountingNavBar from '../components/NavBars/AccountingNavBar';
import AdminNavBar from '../components/NavBars/AdminNavBar';
import AdvisorNavBar from '../components/NavBars/AdvisorNavBar';
import StudentNavBar from '../components/NavBars/StudentNavBar';

import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useApiClient } from '../lib/apiClient';

/**
 * Notifications page component.
 * @returns {JSX.Element} The rendered Notifications page.
 */
export default function Notifications() {
    const { user } = useAuth();
    const api = useApiClient();

    const [notifications, setNotifications] = useState([]);
    const [selectedNotifications, setSelectedNotifications] = useState([]);

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

    // get notifications for user on component mount
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

    // toggle selection of a notification
    const handleSelectNotif = (notifID) => {
        setSelectedNotifications((prev) =>
            prev.includes(notifID)
                ? prev.filter((id) => id !== notifID)
                : [...prev, notifID]
        );
    }

    // mark selected notifications as read
    const handleMarkSelectedRead = async () => {
        try {
            if (selectedNotifications.length === 0) return;

            // check if all selected are already read and toggle accordingly
            // if all are read, mark all as unread, else mark as read
            const allRead = selectedNotifications.every(
                (notifID) => notifications.find(notif => notif.notification_id === notifID)?.is_read
            )

            const newState = !allRead;

            await Promise.all(
                selectedNotifications.map((notifID) =>
                    api.put(`/api/notifications/${notifID}/read`, {
                        is_read: newState,
                    })
                )
            );

            // update local state
            setNotifications((prev) =>
                prev.map((notif) =>
                    selectedNotifications.includes(notif.notification_id)
                        ? { ...notif, is_read: newState }
                        : notif
                )
            );

            // update global unread count for notif button badge
            const change = newState
                ? -selectedNotifications.length
                : selectedNotifications.length;
            if (window.updateUnreadCount) {
                window.updateUnreadCount(change);
            }

        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    // delete selected notifications
    const handleDeleteSelected = async () => {
        try {
            if (selectedNotifications.length === 0) return;

            // make sure user confirms deletion
            if (!window.confirm('Are you sure you want to delete the selected notifications?')) {
                return;
            }

            await Promise.all(
                selectedNotifications.map((notifID) =>
                    api.del(`/api/notifications/${notifID}`)
                )
            );

            // update local state
            setNotifications((prev) =>
                prev.filter(
                    (notif) => !selectedNotifications.includes(notif.notification_id)
                )
            );

            // update global unread count for notif button badge
            const unreadDeleted = notifications.filter(
                (notif) =>
                    selectedNotifications.includes(notif.notification_id) && !notif.is_read
            ).length;

            if (unreadDeleted > 0 && window.updateUnreadCount) {
                window.updateUnreadCount(-unreadDeleted);
            }

            // clear selection
            setSelectedNotifications([]);
        } catch (error) {
            console.error('Error deleting notifications:', error);
        }
    }

    return (
        <div>
            {NavBarComponent && <NavBarComponent />}
            <div className="window">
                <div className="title-bar">
                    <h1>Notifications</h1>
                </div>

                {/* Notifications List */}
                <div className="container">
                    <div className= "notifications-container">
                        {notifications.length === 0 ? (
                            <li className="no-notifs">You have no notifications.</li>
                        ) : (
                            <table className="notif-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedNotifications(notifications.map(n => n.notification_id));
                                                    } else {
                                                        setSelectedNotifications([]);
                                                    }
                                                }}
                                            />
                                        </th>
                                        <th>Title</th>
                                        <th>Message</th>
                                        <th>Date</th>
                                        <th>
                                            <div className="notif-actions">
                                                <button
                                                    className="mark-read-btn"
                                                    onClick={handleMarkSelectedRead}
                                                    disabled={selectedNotifications.length === 0}
                                                >
                                                    {selectedNotifications.every(notifId =>
                                                        notifications.find(n => n.notification_id === notifId)?.is_read
                                                    ) ? <Mail className="icon" /> : <MailOpen className="icon" />}
                                                </button>
                                                <button
                                                    className="notif-delete-btn"
                                                    onClick={handleDeleteSelected}
                                                    disabled={selectedNotifications.length === 0}
                                                >
                                                    <Trash className="icon" />
                                                </button>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notifications.map((notif) => (
                                        <tr key={notif.notification_id} className={`notif-row ${notif.is_read ? 'read' : 'unread'}`}>
                                            <td className="notif-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedNotifications.includes(notif.notification_id)}
                                                    onChange={() => handleSelectNotif(notif.notification_id)}
                                                />
                                            </td>
                                            <td className="notif-title">{notif.title}</td>
                                            <td className="notif-message">{notif.notif_message}</td>
                                            <td className="notif-date">
                                                {notif.created_at
                                                    ? new Date(notif.created_at).toLocaleString() : ''}
                                            </td>
                                            <td></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                </div>
            </div>
        </div>
    </div>
    );
}
