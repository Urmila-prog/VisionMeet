import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

// Determine the API URL based on the environment
const API_URL = import.meta.env.VITE_API_URL || 'https://visionmeet.onrender.com';

// Log the current environment and API configuration
console.log('Socket.IO - Current environment:', import.meta.env.MODE);
console.log('Socket.IO - API URL:', API_URL);
console.log('Socket.IO - Current URL:', window.location.origin);

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        // Get user from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?._id;

        if (!userId) {
            console.log('Socket.IO - No user ID found, skipping connection');
            return;
        }

        console.log('Socket.IO - Initializing connection for user:', userId);

        // Initialize socket connection
        const socketInstance = io(API_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: true,
            path: '/socket.io/',
            extraHeaders: {
                'Access-Control-Allow-Origin': '*'
            }
        });

        // Connection event handlers
        socketInstance.on('connect', () => {
            console.log('Socket.IO - Connected successfully');
            setIsConnected(true);
            toast.success('Connected to server');
            // Join user's room immediately after connection
            socketInstance.emit('join', userId);
            console.log('Joined socket room for user:', userId);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket.IO - Connection error:', {
                message: error.message,
                type: error.type,
                description: error.description
            });
            setIsConnected(false);
            toast.error('Failed to connect to server');
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('Socket.IO - Disconnected:', reason);
            setIsConnected(false);
            toast.error('Disconnected from server');
        });

        // Friend request event handler
        socketInstance.on('friendRequest', (data) => {
            console.log('Socket.IO - Friend request received:', data);
            toast.success(`New friend request from ${data.sender.name}`);
            // Invalidate all relevant queries
            queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
            queryClient.invalidateQueries({ queryKey: ['outgoingFriendReqs'] });
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            console.log('Socket.IO - Cleaning up connection');
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, [queryClient]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}; 