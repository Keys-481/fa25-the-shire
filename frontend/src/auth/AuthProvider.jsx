import { createContext, use, useContext, useEffect, useMemo, useState } from "react";

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

    useEffect(() => {
        localStorage.setItem("auth", JSON.stringify(auth));
    }, [auth]);

    const value = useMemo(() => ({
        isAuthed: auth.isAuthed,
        user: auth.user,
        token: auth.token,
        login: ({ token, user }) => setAuth({ isAuthed: true, token, user }),
        logout: () => setAuth({ isAuthed: false, token: null, user: null }),
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