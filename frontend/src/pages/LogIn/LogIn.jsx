import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import logo from '../../assets/images/boise_state_wbg.png'
import { useAuth } from '../../auth/AuthProvider.jsx'
import '../../styles/Styles.css'

/**
 * @file frontend/src/pages/LogIn/LogIn.jsx
 * @description Login page for SDP website.
 *              Authenticates users when given valid credentials and sends them to their dashboard.
 *              Rejects invalid credentials.
 */


// Helper mappings
const DASHBOARD_BY_ROLE_ID = {
    1: "/admin/dashboard",
    2: "/advisor/dashboard",
    3: "/student/dashboard",
    4: "/accounting/dashboard",
};
const DASHBOARD_BY_ROLE_NAME = {
    admin: "/admin/dashboard",
    advisor: "/advisor/dashboard",
    student: "/student/dashboard",
    accounting: "/accounting/dashboard",
};

/**
 * Gets a users home route based on their default view.
 * Falls back to a user's role if default view is unspecified.
 * @param {*} user The current user
 * @returns The current user's home route
 */
function getHomeRoute(user) {
    if (!user) return "/student/dashboard";

    const dv = user.default_view;

    if (dv !== undefined && dv !== null){
        const asNumber = typeof dv === 'number' ? dv : Number(dv);
        if (!Number.isNaN(asNumber) && DASHBOARD_BY_ROLE_ID[asNumber]) {
            return DASHBOARD_BY_ROLE_ID[asNumber];
        }

        if (typeof dv === 'string' && DASHBOARD_BY_ROLE_NAME[dv]) {
            return DASHBOARD_BY_ROLE_NAME[dv];
        }
    }

    if (user.role && DASHBOARD_BY_ROLE_NAME[user.role]) {
        return DASHBOARD_BY_ROLE_NAME[user.role];
    }

    return "/student/dashboard";
}

export default function LogIn() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { isAuthed, login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthed) return;
        const home = getHomeRoute(user);
        navigate(home, { replace: true });
    }, [isAuthed, user, navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, password }),
            });

            if (!res.ok) {
                setError("Invalid credentials. Please try again.");
                return;
            }

            const data = await res.json();
            login({ token: data.token, user: data.user });

            const from = location.state?.from?.pathname;
            const defaultHome = getHomeRoute(data.user);

            const dest = (from && from !== "/login") ? from : defaultHome;
            navigate(dest, { replace: true });
        } catch {
            setError("Unable to log in. Try again.");
        }
    }

    return (
        <main className="page-wrapper">
            <div className='navbar'>
                <img src={logo} alt="BSU-Logo" style={{ height: '45px', alignItems: 'center', top: '-3px' }} />
            </div>

            <div className="window login-body">
                <div className="login-card">
                    <h1 className="login-title">Log In</h1>

                    <form onSubmit={handleSubmit} data-testid="login-form" className="login-form">
                        <label>
                            Email or Phone Number
                            <input
                                data-testid="identifier"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="example@email.com"
                            />
                        </label>

                        <label>
                            Password
                            <input
                                data-testid="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </label>

                        {error && (
                            <div role="alert" data-testid="error" style={{ color: "red", marginTop: 10}}>
                                {error}
                            </div>
                        )}

                        <button type="submit" data-testid="submit">Log In</button>
                    </form>
                </div>
            </div>
        </main>
    )
}