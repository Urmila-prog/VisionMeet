import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useAuthUser from '../hook/useAuthUser';
import { useQuery } from '@tanstack/react-query';
import { getStreamToken } from '../lib/api';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';

// Import the CSS using a relative path
import '@stream-io/video-react-sdk/dist/css/styles.css';
import toast from 'react-hot-toast';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const Call = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const navigate = useNavigate();

  const { user, isLoading } = useAuthUser();

  const { data: tokenData, error: tokenError } = useQuery({
    queryKey: ['streamToken'],
    queryFn: getStreamToken,
    enabled: !!user,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !user || !callId) {
        console.log('Missing required data:', {
          hasToken: !!tokenData?.token,
          hasUser: !!user,
          hasCallId: !!callId
        });
        return;
      }

      try {
        console.log('Initializing stream video client...', {
          userId: user._id,
          callId: callId
        });

        const userData = {
          id: user._id,
          name: user.Fullname,
          image: user.profilePic,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: userData,
          token: tokenData.token,
        });

        const callInstance = videoClient.call('default', callId);
        await callInstance.join({ create: true });
        console.log('Joined call successfully');

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error('Error joining call:', error);
        toast.error('Could not join the call. Please try again.');
        navigate('/');
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [tokenData, user, callId, navigate]);

  if (isLoading || isConnecting) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Connecting to call...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-error">Failed to initialize call. Please try again.</p>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => navigate('/')}
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className='relative w-full h-full'>
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className='flex items-center justify-center h-full'>
            <p>Could not initialize call. Please try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate('/');
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default Call;
