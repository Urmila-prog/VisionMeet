import { getAuthUser } from '../lib/api';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const useAuthUser = () => {
    const navigate = useNavigate();
    
    const user = useQuery({
        queryKey: ['user'],
        queryFn: getAuthUser,
        retry: 2, // Retry twice
        retryDelay: 1000, // Wait 1 second between retries
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
        refetchOnWindowFocus: true, // Refetch when window regains focus
        refetchOnMount: true, // Refetch when component mounts
        refetchOnReconnect: true, // Refetch when reconnecting
        onError: (error) => {
            console.error('Auth error:', error);
            // Only redirect to login if it's an auth error
            if (error.response?.status === 401) {
                navigate('/login', { replace: true });
            }
        },
        // Keep the previous data while refetching
        keepPreviousData: true,
    });
    
    return {
        isLoading: user.isLoading && !user.data,
        user: user.data?.user,
        error: user.error,
        isError: user.isError,
        isFetching: user.isFetching
    };
};

export default useAuthUser;
