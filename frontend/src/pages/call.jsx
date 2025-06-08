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
  name,
} from '@stream-io/video-react-sdk';

// Import the CSS using a relative path
import '@stream-io/video-react-sdk/dist/css/styles.css';
import toast from 'react-hot-toast';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const Call = () => {
  const {id:callId} = useParams();
  const[client, setClient] = useState(null);
  const[call, setCall] = useState(null);
  const[isConnecting, setIsConnecting] = useState(true);

  const {user, isLoading} = useAuthUser();

  const {data:tokenData} = useQuery({
    queryKey: ['streamToken'],
    queryFn: getStreamToken,
    enabled: !!user,
  });

  useEffect(()=>{
    const initCall = async () => {
     if(tokenData.token || !user || !callId) return;
      try {
        console.log('initializing stream video client...');

        const user = {
          id:user._id,
          name:user.Fullname,
          image:user.profilePic,
        }
        const videoClilent = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        })

        const callInstance = videoClilent.call('default', callId);
         await callInstance.join({create:true})
         console.log('joined call successfully')

         setClient(videoClilent)
         setCall(callInstance)
      } catch (error) {
        console.log('error joining call:', error);
        toast.error('could not join the call. please try again.');
      } finally {
        setIsConnecting(false);
      }
    }
    initCall()
  },[tokenData, user, callId]);
  
  if(isLoading || isConnecting) return <PageLoader />;


  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className='relative'>
          {client && call ? (
            <StreamVideo client={client} >
              <StreamCall call={call} >
              <CallContent />
              </StreamCall>
            </StreamVideo>
          ) : (
              <div className='flex items-center justify-center h-full'>
                <p>Could not initialize call. please try later.</p>
              </div>
          )}
      </div>
    </div>
  );
};

const CallContent = () => {
    const {useCallCallingState} = useCallStateHooks()
    const CallingState = useCallCallingState()

    const navigate = useNavigate();

    if(CallingState === CallingState.LEFT) return('/')
  return (
    <StreamTheme>a
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  )
}

export default Call;
