import axios from "axios";
import { toast } from 'react-hot-toast';

// Determine the base URL based on the environment
const BASE_URL = import.meta.env.VITE_API_URL || 'https://visionmeet.onrender.com';

// Log the current environment and API configuration
console.log('Current environment:', import.meta.env.MODE);
console.log('API URL:', BASE_URL);
console.log('Current URL:', window.location.origin);

// Create axios instance with default config
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Log request details
        console.log('Making request to:', config.url);
        console.log('Request method:', config.method);
        console.log('Request headers:', config.headers);
        console.log('Request data:', config.data);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        // Log authentication state
        console.log('Auth state:', {
            hasToken: !!token,
            hasUser: !!user,
            tokenLength: token ? token.length : 0
        });
        
        // Add auth header if token exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        // Log successful response
        console.log('Response received:', {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data
        });
        return response;
    },
    (error) => {
        // Log detailed error information
        console.error('API Error:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
                data: error.config?.data
            }
        });

        // Handle specific error cases
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Unauthorized - clear auth data and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    toast.error('Session expired. Please login again.');
                    break;
                case 403:
                    toast.error('You do not have permission to perform this action.');
                    break;
                case 404:
                    toast.error('The requested resource was not found.');
                    break;
                case 500:
                    toast.error('An internal server error occurred. Please try again later.');
                    break;
                default:
                    toast.error(error.response.data?.message || 'An error occurred');
            }
        } else if (error.request) {
            // Network error
            console.error('Network error:', error.request);
            toast.error('Network error. Please check your connection.');
        } else {
            // Other error
            console.error('Error:', error.message);
            toast.error('An unexpected error occurred.');
        }

        return Promise.reject(error);
    }
);

export default api;