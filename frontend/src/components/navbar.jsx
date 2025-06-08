import React from 'react'
import useAuthUser from '../hook/useAuthUser'
import { Link, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../lib/api';
import { BellIcon, ShipWheelIcon } from 'lucide-react';
import Theme from './Theme';

const Navbar = () => {
  const { user, isLoading } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith('/chat')
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      window.location.href = '/login'; // Force redirect to login page
    }
  });

  return (
    <nav className='bg-base-200 border-b border-base-300 sticky top-0 z-40 h-16 flex items-center'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between w-full'>
          {/* Logo - only show on mobile (when sidebar is hidden) */}
          <div className='lg:hidden'>
            <Link to='/' className='flex items-center gap-2.5'>
              <ShipWheelIcon className='size-9 text-primary' />
              <span className='text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider'>
                VisionMeet
              </span>
            </Link>
          </div>

          {/* Navigation items */}
          <div className='flex items-center gap-3 sm:gap-4 ml-auto'>
            <Link to={'/notification'}>
              <button className='btn btn-ghost btn-circle hover:bg-base-300'>
                <BellIcon className='h-7 w-7 text-primary hover:text-primary-focus' />
              </button>
            </Link>

            <div className='flex items-center gap-2'>
              <Theme />

              <div className='avatar'>
                <div className='w-9 rounded-full'>
                  {isLoading ? (
                    <div className="w-full h-full bg-base-300 animate-pulse" />
                  ) : (
                    <img 
                      src={user?.profilePic} 
                      alt={user?.Fullname || "User Avatar"} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
              <button 
                className='btn btn-error btn-sm' 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
