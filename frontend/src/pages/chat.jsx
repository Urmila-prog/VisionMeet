import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAuthUser from '../hook/useAuthUser';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getStreamToken, getUserById, createStreamUser } from '../lib/api';
import ChatLoader from '../components/ChatLoader'
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react'
import { StreamChat } from 'stream-chat';
import toast from 'react-hot-toast';
import CallButton from '../components/CallButton';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY

const chat = () => {
  const {id:targetUserId} = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const {user} = useAuthUser();

  const {data:tokenData} = useQuery({
    queryKey: ['streamToken'],
    queryFn: getStreamToken,
    enabled: !!user
  });

  const {data: targetUser} = useQuery({
    queryKey: ['user', targetUserId],
    queryFn: () => getUserById(targetUserId),
    enabled: !!targetUserId
  });

  const createStreamUserMutation = useMutation({
    mutationFn: createStreamUser,
    onError: (error) => {
      console.error('Error creating Stream user:', error);
      toast.error('Failed to initialize chat. Please try again.');
    }
  });

  useEffect(() => {
    const initChat = async () => {
      if(!tokenData?.token || !user || !targetUser) return;
      try {
        console.log('Initializing Stream chat...', {
          currentUser: user._id,
          targetUser: targetUser._id
        });

        // Create Stream users through our backend
        await createStreamUserMutation.mutateAsync(targetUser._id);

        const client = StreamChat.getInstance(STREAM_API_KEY);

        // Connect the current user
        await client.connectUser({
          id: user._id,
          name: user.Fullname,
          image: user.profilePic || '/default-avatar.png',
        }, tokenData.token);

        const channelId = [user._id, targetUser._id].sort().join('_');
        console.log('Creating channel with ID:', channelId);

        const currChannel = client.channel('messaging', channelId, {
          members: [user._id, targetUser._id],
          created_by_id: user._id,
          image: targetUser.profilePic || '/default-avatar.png',
          name: targetUser.Fullname
        });

        await currChannel.watch();
        setChatClient(client);
        setChannel(currChannel);
        console.log('Chat initialized successfully');
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast.error('Could not connect to chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, user, targetUser]);

  const handleVideoCall = () => {
    if(channel) {
      const callUrl = `${window.location.origin}/${channel.id}`;
      channel.sendMessage({
        text: `I've started a video call. Join me: ${callUrl}`,
      });
      toast.success("Video call sent successfully");
    }
  };

  if(loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className='h-[93vh]'>
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className='w-full relative'>
            <Window>
              <div className='relative'>
                <ChannelHeader />
                <div className='absolute right-4 top-1/2 -translate-y-1/2 z-10'>
                  <CallButton handleVideoCall={handleVideoCall} />
                </div>
              </div>
              <MessageList />
              <MessageInput focus/>
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default chat;
