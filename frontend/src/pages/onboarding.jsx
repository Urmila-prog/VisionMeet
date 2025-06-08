import React, { useState } from 'react'
import useAuthUser from '../hook/useAuthUser'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { completeOnboarding } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { LoaderIcon, MapPinIcon, ShuffleIcon } from 'lucide-react';
import { LANGUAGES } from '../../constant';

const Onboarding = () => {
  const { user } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formstate, setFormState] = useState({
    Fullname: user?.Fullname || '',
    bio: user?.bio || '',
    nativelanguage: user?.nativelanguage || '',
    learningLanguage: user?.learningLanguage || '',
    location: user?.location || '',
    profilePic: user?.profilePic || '',
  });

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random()*100)+1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
    setFormState(prev => ({
      ...prev,
      profilePic: randomAvatar
    }));
  };

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success('Profile onboarded successfully');
      queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate('/');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to complete onboarding');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation(formstate);
  };

  const handleChange = (e) => {
    setFormState({
      ...formstate,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className='min-h-screen w-full overflow-x-hidden'>
      <div className='container mx-auto px-4 py-8'>
        <div className='card bg-base-200 w-full max-w-2xl mx-auto shadow-xl'>
          <div className='card-body p-4'>
            <h1 className='text-2xl font-bold text-center mb-4'>Complete Your Profile</h1>

            <form onSubmit={handleSubmit} className='space-y-3'>
              {/* Profile pic */}
              <div className='flex flex-col items-center justify-center'>
                <div className='w-16 h-16 rounded-full bg-base-300 relative overflow-hidden flex items-center justify-center mb-2'>
                  {formstate.profilePic ? (
                    <img 
                      src={formstate.profilePic} 
                      alt="profile preview"
                      className='w-full h-full object-cover' 
                    />
                  ) : (
                    <div className='w-full h-full bg-base-300 flex items-center justify-center'>
                      <ShuffleIcon className='w-8 h-8 text-base-content' strokeWidth={2.5} />
                    </div>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <button 
                    type='button' 
                    onClick={handleRandomAvatar} 
                    className='btn btn-accent btn-sm'
                  >
                    <ShuffleIcon className='size-4 mr-2' />
                    Generate random avatar
                  </button>
                </div>
              </div>

                 <div>
              {/* Full Name */}
              <div>
                <label className="label py-1">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  name="Fullname"
                  placeholder='urmila adhikari'
                  value={formstate.Fullname}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Bio */}
              <div>
                <label className="label py-1">
                  <span className="label-text">Bio</span>
                </label>
                <textarea
                  name="bio"
                  value={formstate.bio}
                  placeholder='accepted by lord shiva'
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full"
                  required
                />
              </div>
              </div>

              {/* languages */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>       
                {/* Native Language */}
                <div className='form-control'>
                  <label className="label">
                    <span className="label-text">Native Language</span>
                  </label>
                  <select 
                    name="nativelanguage" 
                    value={formstate.nativelanguage}
                    onChange={handleChange}
                    className='select select-bordered w-full'
                    required
                  >
                    <option value="">Select your native language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`native-${lang}`} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Learning Language */}
                <div className='form-control'>
                  <label className="label">
                    <span className="label-text">Learning Language</span>
                  </label>
                  <select 
                    name="learningLanguage" 
                    value={formstate.learningLanguage}
                    onChange={handleChange}
                    className='select select-bordered w-full'
                    required
                  >
                    <option value="">Select language to learn</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className='form-control'>
                <label className="label">
                  <span className="label-text">Location</span>
                </label>
                <div className='relative'>
                  <MapPinIcon className='absolute top-1/2 left-3 transform -translate-y-1/2 size-4 text-base-content opacity-80' />
                  <input
                    type="text"
                    name="location"
                    placeholder='city, country'
                    value={formstate.location}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-10"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="btn btn-primary w-full mt-4"
              >
                <LoaderIcon className='animate-spin size-5 mr-2' />
                {isPending ? 'Saving...' : 'Complete Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
