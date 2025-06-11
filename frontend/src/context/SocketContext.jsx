import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthUser from '../hook/useAuthUser';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuthUser();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (user) {
            console.log('Initializing socket connection for user:', user._id);
            const newSocket = io('https://visionmeet.onrender.com', {
                withCredentials: true
            });

            newSocket.on('connect', () => {
                console.log('Socket connected successfully');
                // Join user's room immediately after connection
                newSocket.emit('join', user._id);
                console.log('Joined socket room for user:', user._id);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                toast.error('Failed to connect to real-time updates');
            });

            newSocket.on('friendRequest', (data) => {
                console.log('Received friend request:', data);
                toast.success(`New friend request from ${data.sender.Fullname}`);
                // Invalidate all relevant queries
                queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
                queryClient.invalidateQueries({ queryKey: ['outgoingFriendReqs'] });
                queryClient.invalidateQueries({ queryKey: ['friends'] });
            });

            setSocket(newSocket);

            return () => {
                console.log('Cleaning up socket connection');
                if (newSocket) {
                    newSocket.close();
                }
            };
        }
    }, [user, queryClient]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}; 