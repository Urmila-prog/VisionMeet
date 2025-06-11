import { axiosInstance } from "./axios";
import { queryClient } from '../lib/queryClient';

export const signup = async (signupData) => {
    try {
        const response = await axiosInstance.post('/api/auth/signup', signupData);
        if (response.data.user && response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
};

export const login = async (credentials) => {
    try {
        // Clear any existing auth data first
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        console.log('Attempting login with email:', credentials.email);
        console.log('Login request URL:', `${axiosInstance.defaults.baseURL}/api/auth/login`);
        console.log('Login request config:', {
            baseURL: axiosInstance.defaults.baseURL,
            withCredentials: axiosInstance.defaults.withCredentials,
            headers: axiosInstance.defaults.headers
        });
        
        const response = await axiosInstance.post('/api/auth/login', credentials);
        console.log('Login response:', response.data);
        
        if (!response.data.user || !response.data.token) {
            console.error('Login response missing user or token:', response.data);
            throw new Error('Invalid login response');
        }

        // Store new auth data
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        
        // Verify token was stored
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            console.error('Failed to store token in localStorage');
            throw new Error('Failed to store authentication token');
        }
        
        console.log('Login successful for user:', response.data.user.email);
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        console.error('Login error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
            config: {
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                method: error.config?.method,
                headers: error.config?.headers
            }
        });
        // Clear auth state on error
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        throw error;
    }
};

export const getAuthUser = async () => {
    try {
        console.log('Fetching auth user...');
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }
        const res = await axiosInstance.get('/api/auth/me');
        console.log('Auth user response:', res);
        return res.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
        throw error;
    }
};

export const logout = async () => {
    try {
        await axiosInstance.post('/api/auth/logout');
    } catch (error) {
        console.error('Error in logout:', error);
    } finally {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        queryClient.clear();
    }
};

export const completeOnboarding = async (userData) => {
    try {
        const response = await axiosInstance.post('/api/auth/onboarding', userData);
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        console.error('Onboarding error:', error);
        throw error;
    }
};

export const getUserFriends = async () => {
    try {
        const response = await axiosInstance.get('/api/users/friends');
        return response.data;
    } catch (error) {
        console.error('Error fetching friends:', error);
        throw error;
    }
};

export const getRecommendedUsers = async () => {
    try {
        const response = await axiosInstance.get('/api/users/recommended');
        return response.data;
    } catch (error) {
        console.error('Error fetching recommended users:', error);
        throw error;
    }
};

export const getOutgoingFriendRequests = async () => {
    try {
        const response = await axiosInstance.get('/api/users/outgoing-friend-requests');
        return response.data;
    } catch (error) {
        console.error('Error fetching outgoing friend requests:', error);
        throw error;
    }
};

export const sendFriendRequest = async (userId) => {
    try {
        console.log('Sending friend request to user:', userId);
        const response = await axiosInstance.post(`/api/users/friend-request/${userId}`);
        console.log('Friend request sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending friend request:', error.response?.data || error.message);
        throw error;
    }
};

export const getIncomingFriendRequests = async () => {
    try {
        console.log('Fetching incoming friend requests...');
        const response = await axiosInstance.get('/api/users/friend-requests');
        console.log('Received friend requests response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching incoming friend requests:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        throw error;
    }
};

export const acceptFriendRequest = async (requestId) => {
    try {
        const response = await axiosInstance.put(`/api/users/friend-request/${requestId}/accept`);
        return response.data;
    } catch (error) {
        console.error('Error accepting friend request:', error);
        throw error;
    }
};

export const getStreamToken = async () => {
    try {
        const response = await axiosInstance.get('/api/chat/token');
        return response.data;
    } catch (error) {
        console.error('Error getting stream token:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers
            }
        });
        throw error;
    }
};

export const getUserById = async (userId) => {
    try {
        const response = await axiosInstance.get(`/api/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

export const createStreamUser = async (userId) => {
    try {
        const response = await axiosInstance.post('/api/chat/user', { userId });
        return response.data;
    } catch (error) {
        console.error('Error creating Stream user:', error);
        throw error;
    }
};