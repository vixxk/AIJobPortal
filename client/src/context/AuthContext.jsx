import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../utils/axios';
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            if (storedToken && storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                    const response = await api.get('/auth/me');
                    const userData = response.data.data.user;
                    localStorage.setItem('user', JSON.stringify(userData));
                    setUser(userData);
                } catch (error) {
                    if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                }
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            setLoading(false);
        };
        initAuth();
    }, []);
    const persistUser = useCallback((jwtToken, userData) => {
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    }, []);
    const loginWithGoogle = useCallback(async (googleCredential) => {
        try {
            const response = await api.post('/auth/google', { token: googleCredential });
            const { token: jwtToken, data } = response.data;
            persistUser(jwtToken, data.user);
            return { success: true, user: data.user, isNewUser: data.isNewUser };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Google login failed'
            };
        }
    }, [persistUser]);
    const sendOTP = useCallback(async (email, name) => {
        try {
            const response = await api.post('/auth/send-otp', { email, name });
            return { success: true, isNewUser: response.data.data?.isNewUser };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to send OTP'
            };
        }
    }, []);
    const verifyOTP = useCallback(async (email, otp) => {
        try {
            const response = await api.post('/auth/verify-otp', { email, otp });
            const { token: jwtToken, data } = response.data;
            persistUser(jwtToken, data.user);
            return { success: true, user: data.user };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Invalid OTP'
            };
        }
    }, [persistUser]);
    const login = useCallback(async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token: jwtToken, data } = response.data;
            persistUser(jwtToken, data.user);
            return { success: true, user: data.user };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    }, [persistUser]);
    const register = useCallback(async (name, email, password, role) => {
        try {
            const response = await api.post('/auth/register', { name, email, password, role });
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    }, []);
    const assignRole = useCallback(async (role) => {
        try {
            const response = await api.post('/auth/assign-role', { role });
            const { token: jwtToken, data } = response.data;
            persistUser(jwtToken, data.user);
            return { success: true, user: data.user };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Role assignment failed'
            };
        }
    }, [persistUser]);
    const adminLogin = useCallback(async (email, password) => {
        try {
            const response = await api.post('/auth/admin/login', { email, password });
            const { token: jwtToken, data } = response.data;
            persistUser(jwtToken, data.user);
            return { success: true, user: data.user };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Admin login failed'
            };
        }
    }, [persistUser]);
    const updateProfile = useCallback(async (profileData) => {
        try {
            const response = await api.post('/auth/update-profile', profileData);
            const { data } = response.data;
            const currentToken = localStorage.getItem('token');
            persistUser(currentToken, data.user);
            return { success: true, user: data.user };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update profile'
            };
        }
    }, [persistUser]);
    const uploadAvatar = useCallback(async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await api.post('/auth/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const avatarUrl = response.data.data.avatarUrl;
            const updatedUser = { ...JSON.parse(localStorage.getItem('user') || '{}'), avatar: avatarUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return { success: true, avatarUrl };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to upload avatar'
            };
        }
    }, []);
    const updateSettings = useCallback(async (settings) => {
        try {
            const response = await api.patch('/auth/update-settings', settings);
            const { data } = response.data;
            const currentToken = localStorage.getItem('token');
            persistUser(currentToken, data.user);
            return { success: true, user: data.user };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update settings'
            };
        }
    }, [persistUser]);
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }, []);
    const refreshUser = useCallback(async () => {
        try {
            const response = await api.get('/auth/me');
            const userData = response.data.data.user;
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            }
            return null;
        }
    }, []);
    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            loginWithGoogle,
            sendOTP,
            verifyOTP,
            register,
            assignRole,
            adminLogin,
            updateProfile,
            updateSettings,
            uploadAvatar,
            logout,
            refreshUser
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
