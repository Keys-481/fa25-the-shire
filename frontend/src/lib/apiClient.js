/**
 * @file src/lib/apiClient.js
 * @description API client for frontend to interact with backend server.
 */

import { useCallback, useMemo } from "react";
import { useAuth } from "../auth/AuthProvider";

/**
 * Custom hook to provide API client methods with authentication headers.
 * @returns {Object} API client with get, post, put, delete methods.
 */
export function useApiClient() {
    const { token, user } = useAuth();

    const request = useCallback(async (path, options = {}) => {
        const headers = new Headers(options.headers || {});
        headers.set('Content-Type', 'application/json');

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        if (user?.id) {
            headers.set('X-User-Id', String(user.id));
        }
        if (user?.role) {
            headers.set('X-User-Role', String(user.role));
        }

        const res = await fetch(path, { ...options, headers });
        if (!res.ok) {
            let body;
            try { body = await res.json(); } catch { body = { message: res.statusText }; }
            const error = new Error(body?.message || `HTTP ${res.status}`);
            error.status = res.status;
            error.body = body;
            throw error;
        }
        const text = await res.text();
        try { return JSON.parse(text); } catch { return text; }
    }, [token, user?.id, user?.role]);

    const get = useCallback((p) => request(p), [request]);
    const post = useCallback((p, data) => request(p, { method: 'POST', body: JSON.stringify(data) }), [request]);
    const put = useCallback((p, data) => request(p, { method: 'PUT', body: JSON.stringify(data) }), [request]);
    const del = useCallback((p) => request(p, { method: 'DELETE' }), [request]);

    return useMemo(() => ({ get, post, put, del }), [get, post, put, del]);
}