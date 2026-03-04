import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        token: null,
        user: null,
    });

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setAuth({ token: storedToken, user: JSON.parse(localStorage.getItem('user')) });
        }
    }, []);

    const login = (token, user) => {
        setAuth({ token, user });
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
    };

    const logout = () => {
        setAuth({ token: null, user: null });
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);