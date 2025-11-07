/**
 * @file frontend/src/components/NotifButton.jsx
 * @description Provides a notification button to navigate to the notifications page
 */

import { Bell } from 'lucide-react';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApiClient } from "../lib/apiClient";

export default function NotifButton() {
    const navigate = useNavigate();
    const api = useApiClient();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const data = await api.get('/api/notifications');
            const count = data.notifications.filter(n => !n.is_read).length;
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching unread notifications count:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();

        const interval = setInterval(fetchUnreadCount, 5000);
        return () => clearInterval(interval);
    }, [api]);

    window.updateUnreadCount = (change) => {
        setUnreadCount((prev) => Math.max(0, prev + change));
    }

    return (
        <button
            className="notifications-button"
            onClick={() => navigate('/notifications')}
        >
            <Bell size={20} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </button>
    );
}