import {LANGUAGE_TO_FLAG} from '../constant'
import React from 'react';
import {Link } from 'react-router-dom';

const friendCard = ({friend}) => {
  return (
    <div className='card bg-base-200 hover:shadow-lg transition-all duration-300 h-full'>
       <div className='card-body p-6'>
         <div className='flex items-center gap-4 mb-4'>
            <div className='avatar size-16'>
              <img 
                src={friend.profilePic} 
                alt={friend.Fullname}
                className='rounded-full object-cover'
              />
            </div>
            <div>
              <h3 className='font-semibold text-lg mb-1'>{friend.Fullname}</h3>
              {friend.location && (
                <p className='text-sm opacity-70'>{friend.location}</p>
              )}
            </div>
         </div>

         <div className='flex flex-col gap-3 mb-4'>
            <div className='flex flex-col gap-2 mb-4'>
                <div className='flex items-center gap-2'>
                  <span className='badge badge-primary text-sm py-3 px-4'>
                    {getLanguageFlag(friend.nativelanguage)}
                    <span className='ml-1'>Native: {friend.nativelanguage}</span>
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='badge badge-secondary text-sm py-3 px-4'>
                    {getLanguageFlag(friend.learningLanguage)}
                    <span className='ml-1'>Learning: {friend.learningLanguage}</span>
                  </span>
                </div>
             </div>
            {friend.bio && (
              <p className='text-sm opacity-80 line-clamp-2'>{friend.bio}</p>
            )}
         </div>

         <div className='mt-auto'>
           <Link 
             to={`/chat/${friend._id}`} 
             className='btn btn-primary w-full hover:btn-primary-focus'
           >
             Start Chat
           </Link>
         </div>
       </div>
    </div>
  )
}

export default friendCard;

function getLanguageFlag(language) {
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
}