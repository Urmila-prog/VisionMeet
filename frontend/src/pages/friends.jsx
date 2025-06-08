import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserFriends } from '../lib/api';
import { Link } from 'react-router-dom';
import { MessageSquareIcon, SearchIcon, MapPinIcon } from 'lucide-react';
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

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: getUserFriends,
  });

  // Filter friends based on search query
  const filteredFriends = friends.filter(friend => 
    friend.Fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.nativelanguage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.learningLanguage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='container mx-auto max-w-4xl'>
        <div className='flex flex-col gap-4 mb-6'>
          <div className='space-y-2'>
            <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>Friends</h1>
            <p className='text-base-content/70'>Connect and chat with your language partners</p>
          </div>
          <div className='join w-full sm:w-auto'>
            <div className='join-item flex-1'>
              <input
                type='text'
                placeholder='Search friends...'
                className='input input-bordered join-item w-full'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className='btn join-item'>
              <SearchIcon className='size-4' />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className='flex justify-center py-12'>
            <span className='loading loading-spinner loading-lg'/>
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className='card bg-base-200 p-6 text-center'>
            <h3 className='font-semibold text-lg mb-2'>No friends found</h3>
            <p className='text-base-content opacity-70'>Try adjusting your search or connect with new language partners</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {filteredFriends.map((friend) => (
              <div 
                key={friend._id}
                className='card bg-base-200 hover:shadow-lg transition-all duration-300'
              >
                <div className='card-body p-4'>
                  <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
                    <div className='flex items-center gap-2 w-full sm:w-auto'>
                      <div className='avatar'>
                        <div className='size-6 rounded-full'>
                          <img 
                            src={friend.profilePic || '/default-avatar.png'} 
                            alt={friend.Fullname}
                            className='object-cover'
                          />
                        </div>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-semibold text-xs truncate'>{friend.Fullname}</h3>
                        {friend.location && (
                          <div className='flex items-center text-[10px] opacity-70 mt-0.5'>
                            <MapPinIcon className='size-2.5 mr-0.5' />
                            <span className='truncate'>{friend.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='flex flex-col gap-2 w-full sm:w-auto'>
                      <div className='flex flex-wrap gap-2'>
                        <span className='badge badge-primary text-xs whitespace-nowrap'>
                          {getLanguageFlag(friend.nativelanguage)}
                          <span className='ml-1'>Native: {friend.nativelanguage}</span>
                        </span>
                        <span className='badge badge-secondary text-xs whitespace-nowrap'>
                          {getLanguageFlag(friend.learningLanguage)}
                          <span className='ml-1'>Learning: {friend.learningLanguage}</span>
                        </span>
                      </div>
                      <Link 
                        to={`/chat/${friend._id}`}
                        className='btn btn-primary btn-sm w-full sm:w-auto'
                      >
                        <MessageSquareIcon className='size-4 mr-2' />
                        Chat
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends; 