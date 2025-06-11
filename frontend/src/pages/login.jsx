import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { login } from '../lib/api';
import { ShipWheelIcon } from 'lucide-react';
import { axiosInstance } from '../lib/axios';

const Login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      try {
        const response = await login(credentials);
        console.log('Login response:', response);
        return response;
      } catch (error) {
        console.error('Login attempt failed:', error);
        throw error;
      }
    },
    retry: 1, // Only retry once
    retryDelay: 2000, // Wait 2 seconds between retries
    onSuccess: (data) => {
      console.log('Login successful:', data);
      console.log('User data:', data.user);
      console.log('Is onboarded:', data.user?.isOnboarded);
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Login successful!');
      
      // Check if user needs to complete onboarding
      if (!data.user.isOnboarded) {
        console.log('User needs onboarding, redirecting to /onboarding');
        navigate('/onboarding');
      } else {
        console.log('User is onboarded, redirecting to /');
        navigate('/');
      }
    },
    onError: (error) => {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      // More specific error messages based on the error
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        toast.error('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (error.response?.status === 401) {
        toast.error('Invalid email or password');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Please fill in all fields');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Attempting login with:', { email: formData.email });
    loginMutation.mutate(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="bg-gray-800 rounded-xl shadow-lg w-full max-w-5xl mx-auto border border-primary/25 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Login form */}
          <div className="w-full md:w-1/2 p-8">
            {/* logo */}
            <div className='mb-6 flex items-center justify-start gap-2'>
              <ShipWheelIcon className='text-primary size-9' />
              <span className='text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider'>VisionMeet</span>
            </div>

            <div className='mb-6'>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
              <p className='text-sm opacity-70'>sign in to your account to continue your language journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder='urmila@gmail.com'
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label htmlFor="password" className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder='******'
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="input input-bordered w-full"
                />
              </div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full btn btn-primary mt-4"
              >
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Right side - Image and text */}
          <div className='w-full md:w-1/2 flex items-center justify-center p-8 bg-green-950'>
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
    </div>
  );
};

export default Login;
