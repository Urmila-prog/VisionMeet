import axios from "axios";
import toast from 'react-hot-toast';

const BASE_URL = '@https://visionmeet.onrender.com'



// Create axios instance with default config
export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        console.log('Request interceptor - Auth state:', {
            hasToken: !!token,
            hasUser: !!user
        });
        
        // If token exists, add it to the headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Added token to request headers');
        } else {
            console.log('No token found in localStorage');
            // Remove any existing Authorization header
            delete config.headers.Authorization;
        }

        // Ensure CORS headers are set
        config.withCredentials = true;
        
        // Log the request for debugging
        console.log('Making request to:', config.url, {
            method: config.method,
            data: config.data,
            headers: {
                ...config.headers,
                Authorization: config.headers.Authorization ? 'Bearer [REDACTED]' : undefined
            },
            withCredentials: config.withCredentials
        });
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error.message);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Log successful responses for debugging
        console.log('Response received:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    async (error) => {
        // Log detailed error information
        const errorDetails = {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            code: error.code
        };
        console.error('API Error:', errorDetails);

        // Handle network errors
        if (!error.response) {
            // Check if it's a timeout
            if (error.code === 'ECONNABORTED') {
                toast.error('Request timed out. Please try again.');
            } else {
                // Check if it's a connection refused error
                if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    toast.error('Server is not running. Please start the backend server.');
                    // Only redirect to login if we're not already there
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                } else {
                    toast.error('Network error. Please check your connection.');
                }
            }
            return Promise.reject(error);
        }

        // Handle specific error status codes
        switch (error.response.status) {
            case 401:
                // Clear auth data on unauthorized
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                toast.error('Session expired. Please login again.');
                // Redirect to login if unauthorized
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                break;
            case 403:
                toast.error('Access denied. Please check your permissions.');
                break;
            case 404:
                toast.error('Resource not found.');
                break;
            case 500:
                toast.error('Server error. Please try again later.');
                break;
            default:
                // Use the error message from the server if available
                const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
                toast.error(errorMessage);
        }

        return Promise.reject(error);
    }
);