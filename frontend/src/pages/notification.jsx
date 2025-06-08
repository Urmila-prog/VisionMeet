import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon } from 'lucide-react';
import { acceptFriendRequest, getIncomingFriendRequests } from '../lib/api';
import NoNotificationiconFound from './NoNotificationFound';
import React from 'react'
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const notification = () => {
const queryClient = useQueryClient();

const {data:friendRequests, isLoading, error} = useQuery({
  queryKey: ['friendRequests'],
  queryFn: getIncomingFriendRequests,
  refetchInterval: 5000, // Refetch every 5 seconds
  onError: (error) => {
    console.error('Error fetching friend requests:', error);
    toast.error('Failed to load friend requests');
  }
});

// Add debugging logs
console.log('Friend Requests Data:', friendRequests);
console.log('Incoming Requests:', friendRequests?.incomingReqs);
console.log('Accepted Requests:', friendRequests?.acceptedReqs);

const {mutate:acceptRequestMutation, isPending} = useMutation({
  mutationFn: acceptFriendRequest,
  onSuccess: () => {
    // Invalidate all relevant queries
    queryClient.invalidateQueries({queryKey:['friendRequests']});
    queryClient.invalidateQueries({queryKey:['friends']});
    queryClient.invalidateQueries({queryKey:['outgoingFriendReqs']});
    toast.success('Friend request accepted!');
  },
  onError: (error) => {
    console.error('Error accepting friend request:', error);
    toast.error(error.response?.data?.message || 'Failed to accept friend request');
  }
});

// Handle error state
if (error) {
  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='container mx-auto max-w-4xl'>
        <div className='alert alert-error'>
          <p>Failed to load notifications. Please try refreshing the page.</p>
        </div>
      </div>
    </div>
  );
}

const incomingRequests = friendRequests?.incomingReqs || [];
const acceptedRequests = friendRequests?.acceptedReqs || [];

return (
  <div className='p-4 sm:p-6 lg:p-8'>
    <div className='container mx-auto max-w-4xl'>
      <h1 className='text-2xl sm:text-3xl font-bold tracking-tight mb-8'>Notifications</h1>

      {isLoading ? (
        <div className='flex justify-center py-12'>
          <span className='loading loading-spinner loading-lg'/>
        </div>
      ) : incomingRequests.length === 0 && acceptedRequests.length === 0 ? (
        <NoNotificationiconFound />
      ) : (
        <div className='space-y-6'>
          {/* Incoming Friend Requests */}
          {incomingRequests.length > 0 && (
            <div className='card bg-base-200'>
              <div className='card-body'>
                <h2 className='card-title'>
                  <BellIcon className='size-5'/>
                  Incoming Friend Requests
                </h2>
                <div className='space-y-4'>
                  {incomingRequests.map((request) => (
                    <div key={request._id} className='flex items-center justify-between p-4 bg-base-100 rounded-lg'>
                      <div className='flex items-center gap-4'>
                        <div className='avatar'>
                          <div className='size-12 rounded-full'>
                            <img 
                              src={request.sender.profilePic || '/default-avatar.png'} 
                              alt={request.sender.Fullname} 
                            />
                          </div>
                        </div>
                        <div>
                          <h3 className='font-semibold'>{request.sender.Fullname}</h3>
                          <p className='text-sm opacity-70'>{request.sender.bio}</p>
                        </div>
                      </div>
                      <button 
                        className='btn btn-primary btn-sm'
                        onClick={() => acceptRequestMutation(request._id)}
                        disabled={isPending}
                      >
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Accepted Friend Requests */}
          {acceptedRequests.length > 0 && (
            <div className='card bg-base-200'>
              <div className='card-body'>
                <h2 className='card-title'>
                  <UserCheckIcon className='size-5'/>
                  Accepted Friend Requests
                </h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {acceptedRequests.map((request) => (
                    <div key={request._id} className='card bg-base-100 hover:shadow-lg transition-all duration-300'>
                      <div className='card-body p-4'>
                        <div className='flex items-center gap-3 mb-3'>
                          <div className='avatar'>
                            <div className='size-10 rounded-full'>
                              <img 
                                src={request.sender._id === request.recipient._id ? request.recipient.profilePic : request.sender.profilePic || '/default-avatar.png'} 
                                alt={request.sender._id === request.recipient._id ? request.recipient.Fullname : request.sender.Fullname} 
                              />
                            </div>
                          </div>
                          <div>
                            <h3 className='font-semibold text-sm'>
                              {request.sender._id === request.recipient._id ? request.recipient.Fullname : request.sender.Fullname}
                            </h3>
                            <p className='text-xs opacity-70 line-clamp-1'>
                              {request.sender._id === request.recipient._id ? request.recipient.bio : request.sender.bio}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-2 text-xs text-base-content/70'>
                          <ClockIcon className='size-3' />
                          <span>Accepted {new Date(request.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);
};

export default notification;
