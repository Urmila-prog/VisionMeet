import React from 'react'
import useAuthUser from '../hook/useAuthUser'
import { Link, useLocation } from 'react-router-dom'
import { BellIcon, HomeIcon, ShipWheelIcon, UserIcon, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, isLoading } = useAuthUser();
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}
            
            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-64 bg-base-200 border-r border-base-300
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                flex flex-col h-screen
            `}>
                <div className='p-5 border-border-base-300 flex justify-between items-center'>
                    <Link to='/' className='flex items-center gap-2.5'>
                        <ShipWheelIcon className='size-9 text-primary' />
                        <span className='text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider'>
                            VisionMeet
                        </span>
                    </Link>
                    <button 
                        onClick={onClose}
                        className="lg:hidden p-2 hover:bg-base-300 rounded-lg"
                    >
                        <X className="size-6" />
                    </button>
                </div>

                <nav className='flex-1 p-4 space-y-1'>
                    <Link to='/' 
                        className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === '/' ? 'btn-active' : ""}`}
                        onClick={onClose}
                    >
                        <HomeIcon className='size-5 text-base-content opacity-70' />
                        <span>Home</span>
                    </Link>

                    <Link to='/friends' 
                        className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === '/friends' ? 'btn-active' : ""}`}
                        onClick={onClose}
                    >
                        <UserIcon className='size-5 text-base-content opacity-70' />
                        <span>Friends</span>
                    </Link>

                    <Link to='/notification' 
                        className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === '/notification' ? 'btn-active' : ""}`}
                        onClick={onClose}
                    >
                        <BellIcon className='size-5 text-base-content opacity-70' />
                        <span>Notification</span>
                    </Link>
                </nav>

                {/* user profile */}
                <div className='p-4 border-t bg-base-300 mt-auto'>
                    <div className='flex items-center gap-3'>
                        <div className='avatar'>
                            <div className='w-10 rounded-full'>
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
                        <div className='flex-1'>
                            <p className='font-semibold text-sm'>{isLoading ? 'Loading...' : user?.Fullname}</p>
                            <p className='text-xs text-success flex items-center gap-1'>
                                <span className='size-2 rounded-full bg-success inline-block' />
                                Online
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
