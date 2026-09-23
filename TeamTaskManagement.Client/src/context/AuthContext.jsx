import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginApi } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem('token');
    });

    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);

        try {
            const response = await loginApi({
                email,
                password
            });

            localStorage.setItem('token', response.token);

            localStorage.setItem(
                'user',
                JSON.stringify({
                    userId: response.userId,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    email: response.email,
                    role: response.role
                })
            );

            setToken(response.token);

            setUser({
                userId: response.userId,
                firstName: response.firstName,
                lastName: response.lastName,
                email: response.email,
                role: response.role
            });

            return response;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setToken(null);
        setUser(null);
    };

    const isAuthenticated = !!token;

    useEffect(() => {
        if (!token) {
            setUser(null);
        }
    }, [token]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};