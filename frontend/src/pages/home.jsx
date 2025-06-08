import React, { useEffect, useState } from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import { getOutgoingFriendRequests, getRecommendedUsers, getUserFriends, sendFriendRequest} from '../lib/api';
import {Link} from 'react-router-dom'
import {CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon, MessageSquareIcon, SearchIcon} from 'lucide-react';
import FriendCard from '../components/friendCard';
import NoFriendsFound from '../components/NoFriendsFound';
import { capitalize } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { LANGUAGE_TO_FLAG } from '../constant';

// Helper function to get language flag
const getLanguageFlag = (language) => {
    if(!language) return null;

    const langLower = language.toLowerCase();
    const countryCode = LANGUAGE_TO_FLAG[langLower];

    if(countryCode){
        return (
            <img 
                src={`https://flagcdn.com/24x18/${countryCode}.png`} 
                alt={`${langLower} Flag`}
                className='h-4 mr-1 inline-block' 
            />
        );
    }
    return null;
};

const Home = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const {data:friends = [], isLoading:loadingFriends} = useQuery({
    queryKey: ['friends'],
    queryFn: getUserFriends,
  });

  const {data:recommendedUsers=[], isLoading:loadingUsers} = useQuery({
    queryKey: ['users'],
    queryFn: getRecommendedUsers,
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5,
  });

  const {data: outgoingFriendReqs, isLoading: loadingOutgoingReqs} = useQuery({
    queryKey: ['outgoingFriendReqs'],
    queryFn: getOutgoingFriendRequests,
    onError: (error) => {
      console.error('Error fetching outgoing friend requests:', error);
      toast.error('Failed to load outgoing friend requests');
    }
  });

  const {mutate:sendRequestMutation, isPending} = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess:(data) => {
      queryClient.invalidateQueries({queryKey:['outgoingFriendReqs']});
      toast.success('Friend request sent successfully!');
    },
    onError: (error) => {
      if (error.response?.data?.message !== 'a friend request already exists') {
        console.error('Error sending friend request:', error);
        toast.error(error.response?.data?.message || 'Failed to send friend request');
      }
    }
  });

  useEffect(()=>{
    const outgoingIds = new Set();
    if(outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        if (req.recipient && req.recipient._id) {
          outgoingIds.add(req.recipient._id);
        }
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  },[outgoingFriendReqs])

  // Filter friends based on search query
  const filteredFriends = friends.filter(friend => 
    friend.Fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.nativelanguage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.learningLanguage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='p-4 sm:p-6 lg:p-8'> 
      <div className='container mx-auto space-y-10'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <div className='space-y-2'>
            <h2 className='text-2xl sm:text-3xl font-bold tracking-tighter'>Your Friends</h2>
            <p className='text-base-content/70'>Connect and practice languages with your friends</p>
          </div>
          <div className='flex gap-3'>
            <div className='join'>
              <div className='join-item'>
                <input
                  type='text'
                  placeholder='Search friends...'
                  className='input input-bordered join-item'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className='btn join-item'>
                <SearchIcon className='size-4' />
              </button>
            </div>
            <Link to='/notification' className='btn btn-outline'>
              <UsersIcon className='mr-2 size-4'/>
              Friend Requests
            </Link>
          </div>
        </div>

        {loadingFriends ? (
          <div className='flex justify-center py-12'>
            <span className='loading loading-spinner loading-lg'/>
          </div>
        ) : filteredFriends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {filteredFriends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        <section>
          <div className='mb-6 sm:mb-8'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
              <div>
                <h2 className='text-2xl sm:text-3xl font-bold tracking-tight'>Meet New Learners</h2>
                <p className='opacity-70'>Discover perfect language exchange partners based on your profile</p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className='flex justify-center py-12'>
              <span className='loading loading-spinner loading-lg'/>
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className='card border-base-200 p-6 text-center'>
              <h3 className='font-semibold text-lg mb-2'>No recommendations available</h3>
              <p className='text-base-content opacity-70'>Check back later for new language partners</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div 
                    key={user._id}
                    className='card bg-base-200 hover:shadow-lg transition-all duration-300'
                  >
                    <div className='card-body p-5 space-y-4'>
                      <div className='flex items-center gap-3'>
                        <div className='avatar size-16 rounded-full'>
                          <img 
                            src={user.profilePic || '/default-avatar.png'} 
                            alt={user.Fullname}
                            className='object-cover'
                          />
                        </div>
                        <div>
                          <h3 className='font-semibold text-lg'>{user.Fullname}</h3>
                          {user.location && (
                            <div className='flex items-center text-xs opacity-70 mt-1'>
                              <MapPinIcon className='size-3 mr-1'/>
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='flex flex-nowrap gap-2 items-center overflow-x-auto'>
                        <span className='badge badge-primary text-sm py-3 px-4 flex-shrink-0'>
                          {getLanguageFlag(user.nativelanguage)}
                          <span className='ml-1'>Native: {capitalize(user.nativelanguage)}</span>
                        </span>
                        <span className='badge badge-secondary text-sm py-3 px-4 flex-shrink-0'>
                          {getLanguageFlag(user.learningLanguage)}
                          <span className='ml-1'>Learning: {capitalize(user.learningLanguage)}</span>
                        </span>
                      </div>

                      {user.bio && <p className='text-sm opacity-70 line-clamp-2'>{user.bio}</p>}
                      
                      <div className='flex gap-2'>
                        <button 
                          className={`btn flex-1 ${
                            hasRequestBeenSent ? 'btn-disabled' : 'btn-primary'
                          }`}
                          onClick={() => sendRequestMutation(user._id)}
                          disabled={hasRequestBeenSent || isPending}
                        >
                          {hasRequestBeenSent ? (
                            <>
                              <CheckCircleIcon className='size-4 mr-2' />
                              Request sent
                            </>
                          ) : (
                            <>
                              <UserPlusIcon className='size-4 mr-2' />
                              Add Friend
                            </>
                          )}
                        </button>
                        <Link 
                          to={`/chat/${user._id}`}
                          className='btn btn-outline flex-1'
                        >
                          <MessageSquareIcon className='size-4 mr-2' />
                          Message
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Home;

