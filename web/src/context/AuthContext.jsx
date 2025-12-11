import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // ... login, register, logout logic ...

    const login = async (email, password) => {
        const response = await axios.post('http://localhost:5000/api/users/login', {
            email,
            password,
        });
        if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
            setUser(response.data);
        }
        return response.data;
    };

    const register = async (username, email, password) => {
        const response = await axios.post('http://localhost:5000/api/users', {
            username,
            email,
            password,
        });
        if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
            setUser(response.data);
        }
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token: user?.token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;
