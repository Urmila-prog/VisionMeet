import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ShipWheelIcon } from 'lucide-react';
import { signup } from '../lib/api';

const Signup = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    Fullname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Account created successfully!');
      
      // Check if user is authenticated and needs onboarding
      if (data.success && data.user) {
        if (!data.user.isOnboarded) {
          navigate('/onboarding');
        } else {
          navigate('/');
        }
      } else {
        // If not authenticated, redirect to login
        navigate('/login');
      }
    },
    onError: (error) => {
      console.error('Signup error:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please try again.');
      } else {
        toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const { confirmPassword, ...signupData } = formData;
    signupMutation.mutate(signupData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8" data-theme='forest'>
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full overflow-hidden flex flex-col md:flex-row max-w-5xl mx-auto border border-primary/25">
        {/* signup form left side*/}
        <div className='w-full md:w-1/2 p-4 sm:p-8 flex flex-col'>
          {/* logo */}
          <div className='mb-4 flex items-center justify-start gap-2'>
            <ShipWheelIcon className='size-10 text-primary'/>
            <span className='text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider'>
              VisionMeet
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="Fullname" className="block text-sm font-medium text-gray-300 ">
                Full Name
              </label>
              <input
                type="text"
                id="Fullname"
                name="Fullname"
                placeholder='urmilla adhikari'
                value={formData.Fullname}
                onChange={handleChange}
                required
                autoComplete="name"
                className="p-1 mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder='urmilla@gmail.com'
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="p-1 mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder='*******'
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="new-password"
                className="p-1 mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                placeholder='*******'
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="new-password"
                className="p-1 mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className='form-control'>
              <label className='cursor-pointer flex items-start gap-2'>
                <input type="checkbox" className='checkbox checkbox-xs mt-1' required />
                <span className='text-xs leading-tight'>
                  I agree to the {''}
                  <span className='text-primary hover:underline'>terms of services</span> and {''}
                  <span className='text-primary hover:underline'>privacy policy</span>
                </span>
              </label>
            </div>
            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {signupMutation.isPending ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Log in
            </button>
          </p>
        </div>

        {/* signup form right side */}
        <div className='w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 bg-green-950'>
          <div className='max-w-md w-full'>
            <div className='relative aspect-square max-w-sm mx-auto'>
              <img src="/i.png" alt="language connection illustration" className='w-full h-full object-contain' />
            </div>
            <div className='text-center space-y-3 mt-6'>
              <h2 className='text-xl font-semibold text-white'>Connect with language partners</h2>
              <p className='text-gray-300 opacity-70'>
                Practice conversation, make friends, and improve your language skills together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
