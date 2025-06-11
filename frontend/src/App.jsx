import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home.jsx';
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';
import Notification from './pages/notification.jsx';
import Onboarding from './pages/onboarding.jsx';
import Chat from './pages/chat.jsx';
import Call from './pages/call.jsx';
import Friends from './pages/friends.jsx';
import { Toaster } from 'react-hot-toast';
import useAuthUser from './hook/useAuthUser';
import PageLoader from './components/pageloader';
import { Layout } from './components/layout.jsx';
import useThemeStore from './store/themeStore';

const App = () => {
  const { user, isLoading, error } = useAuthUser();
  const { theme, setTheme } = useThemeStore();

  // Initialize theme on app load and handle hydration
  useEffect(() => {
    // Wait for hydration to complete
    const timeoutId = setTimeout(() => {
      if (theme) {
        document.documentElement.setAttribute('data-theme', theme);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [theme]);

  // Show loading state only during initial load
  if (isLoading && !user) {
    return <PageLoader />;
  }

  // Handle authentication state
  const isAuthenticated = Boolean(user);
  const isOnboarded = user?.isOnboarded;

  // If there's an auth error, redirect to login
  if (error?.response?.status === 401) {
    return <Navigate to="/login" replace />;
  }
 
  return (
    <div className='h-screen' data-theme={theme}>
      <Routes>
        <Route 
          path='/'
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <Home />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? '/login' : '/onboarding'} replace />
            )
          }
        />
        <Route 
          path='/signup'
          element={
            !isAuthenticated ? <Signup /> : <Navigate to={isOnboarded ? '/' : '/onboarding'} replace />
          } 
        />
        <Route 
          path='/login'
          element={
            !isAuthenticated ? <Login /> : <Navigate to={isOnboarded ? '/' : '/onboarding'} replace />
          } 
        />
        <Route 
          path='/notification' 
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar= {true}>
                <Notification />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? '/login' : '/onboarding'} />
            )
          } 
        />
        <Route 
          path='/friends' 
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <Friends />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? '/login' : '/onboarding'} />
            )
          } 
        />
        <Route 
          path='/onboarding' 
          element={
            isAuthenticated ? (
              !isOnboarded ? <Onboarding /> : <Navigate to='/' replace />
            ) : (
              <Navigate to='/login' replace />
            )
          } 
        />
        <Route 
          path='/call/:id' 
          element={
            isAuthenticated && isOnboarded ? (
              <Call />
            ) : (
              <Navigate to={!isAuthenticated ? '/login' : '/onboarding'} />
            )
          }
        />
        <Route 
          path='/chat/:id' 
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar= {false}>
                <Chat />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? '/login' : '/onboarding'} />
            )
          } 
        />
      </Routes> 
      <Toaster position="top-right" />
    </div> 
  );
};

export default App;
