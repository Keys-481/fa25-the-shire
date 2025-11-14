import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * Resets all user interface preferences back to default values.
 *
 * @function resetPreferences
 * @returns {void} Performs DOM side effects; does not return a value.
 */
function resetPreferences() {
    document.body.classList.remove("dark-theme");
    document.documentElement.style.setProperty("--font-size-change", "0px");
    document.documentElement.style.setProperty("--font-family-change", "Arial, sans-serif");
}

const AuthContext = createContext(null);

/**
 * Provider component to manage authentication state and provide it to child components.
 * Persists into `localStorage` under the key `"auth"`.
 * 
 * @param {{ children: React.ReactNode }} props - The props object containing child components.
 * @returns {JSX.Element} The AuthProvider component wrapping its children with AuthContext.
 */
export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(() => {
        const raw = localStorage.getItem("auth");
        return raw ? JSON.parse(raw) : { isAuthed: false, token: null, user: null };
    });

    /**
     * useEffect hook that persists authentication state to localStorage.
     */
    useEffect(() => {
        localStorage.setItem("auth", JSON.stringify(auth));
    }, [auth]);

    const value = useMemo(() => ({
        isAuthed: auth.isAuthed,
        user: auth.user,
        token: auth.token,
        login: ({ token, user }) => setAuth({ isAuthed: true, token, user }),
        logout: () => {
            setAuth({ isAuthed: false, token: null, user: null });
            resetPreferences();
        },
    }), [auth]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}

/**
 * Custom hook to access the authentication context.
 * Should be used within components wrapped by AuthProvider.
 * 
 * @returns The authentication context value.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}