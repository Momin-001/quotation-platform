"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext({
    user: null,
    loading: true,
    isAuthenticated: false,
    login: async () => { },
    logout: async () => { },
    isUser: false,
    isAdmin: false,
    isSuperAdmin: false,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isUser, setIsUser] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const res = await fetch("/api/auth/me");
            const response = await res.json();
            if (!response.success) {
                throw new Error(response.message || "Something went wrong");
            }
            setUser(response.data);
            setIsAuthenticated(true);
            setIsUser(response.data.role === 'user');
            setIsAdmin(response.data.role === 'admin');
            setIsSuperAdmin(response.data.role === 'super_admin');
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            setIsUser(false);
            setIsAdmin(false);
            setIsSuperAdmin(false);
        }
        finally {
            setLoading(false);
        }
    };

    const login = async (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        setIsUser(userData.role === 'user');
        setIsAdmin(userData.role === 'admin');
        setIsSuperAdmin(userData.role === 'super_admin');
        router.push(userData.role === 'admin' || userData.role === 'super_admin' ? '/admin' : '/');
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' }); 
        } catch (e) { 

        }

        setUser(null);
        setIsAuthenticated(false);
        setIsUser(false);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, isUser, isAdmin, isSuperAdmin, login, logout, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
