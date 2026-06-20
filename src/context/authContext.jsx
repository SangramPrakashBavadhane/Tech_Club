import React from "react";
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const API_URL = import.meta.env.VITE_API_URL;

    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('syntax_user');
        const storedToken = localStorage.getItem('syntax_token');

        if (storedUser && storedToken) {
            setCurrentUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const currentRole = currentUser ? currentUser.role : 'GUEST';


    const registerUser = async (username, email, password, academicYear, interestTags) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, academicYear, interestTags })
            })
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            localStorage.setItem('syntax_user', JSON.stringify(data.user));
            localStorage.setItem('syntax_token', data.token);
            setCurrentUser(data.user);

            return { success: true };

        } catch (error) {
            return { success: false, message: error.message };
        }





    }

    const loginUser = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            // Save token and user details in browser local storage
            localStorage.setItem('syntax_token', data.token);
            localStorage.setItem('syntax_user', JSON.stringify(data.user));
            setCurrentUser(data.user);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const logoutUser = () => {
        localStorage.removeItem('syntax_token');
        localStorage.removeItem('syntax_user');
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            currentRole,
            loading,
            registerUser,
            loginUser,
            logoutUser
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}




