import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider.jsx'
import logo from '../../assets/images/boise_state_wbg.png'
import '../../styles/Styles.css'


export default function LogIn() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { isAuthed, login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthed) return;
        const role = user?.default_view;
        const roleHome = ({
            1: "/student/dashboard",
            2: "/advisor/dashboard",
            3: "/admin/dashboard",
            4: "/accounting/dashboard",
        })[role] || "/student/dashboard";
        navigate(roleHome, { replace: true });
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

            const role = data?.user?.role;
            const roleHome = ({
                admin: "/admin/dashboard",
                advisor: "/advisor/dashboard",
                student: "/student/dashboard",
                accounting: "/accounting/dashboard",
            })[role] || "/student/dashboard";

            const from = location.state?.from?.pathname;
            const dest = (from && from !== "/login") ? from : roleHome;
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