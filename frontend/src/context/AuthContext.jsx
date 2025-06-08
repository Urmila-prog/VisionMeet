import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup, logout as apiLogout, getAuthUser } from '../lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const clearAuthState = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    clearAuthState();
                    return;
                }

                const userData = await getAuthUser();
                if (!userData) {
                    clearAuthState();
                    return;
                }

                setUser(userData);
            } catch (error) {
                console.error('Auth initialization error:', error);
                clearAuthState();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            // Clear existing auth state before login
            clearAuthState();
            
            const { user: userData, token } = await apiLogin(email, password);
            if (!userData || !token) {
                throw new Error('Invalid login response');
            }

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', token);
            setUser(userData);
            toast.success('Login successful!');
            return userData;
        } catch (error) {
            console.error('Login error:', error);
            clearAuthState();
            throw error;
        }
    };

    const signup = async (userData) => {
        try {
            // Clear existing auth state before signup
            clearAuthState();
            
            const { user: newUser, token } = await apiSignup(userData);
            if (!newUser || !token) {
                throw new Error('Invalid signup response');
            }

            localStorage.setItem('user', JSON.stringify(newUser));
            localStorage.setItem('token', token);
            setUser(newUser);
            toast.success('Signup successful!');
            return newUser;
        } catch (error) {
            console.error('Signup error:', error);
            clearAuthState();
            throw error;
        }
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearAuthState();
            toast.success('Logged out successfully');
        }
    };

    const value = {
        user,
        loading,
        login,
        signup,
        logout,
        clearAuthState
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 