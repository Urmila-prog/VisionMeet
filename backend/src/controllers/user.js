import User from "../models/User.js";
import friendrequest from "../models/friendrequest.js";

export async function getuserbyid(req, res) {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error('Error in getuserbyid:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getrecommendeduser(req, res) {
    try {
        const currentUser = req.user;
        const currentUserId = currentUser._id;

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } },
                { _id: { $nin: currentUser.friends } },
                { isOnboarded: true }
            ]
        }).select('Fullname profilePic nativelanguage learningLanguage bio location');

        res.status(200).json(recommendedUsers);
    } catch (err) {
        console.log('error in getrecommendedusers controller:', err.message);
        res.status(500).json({ message: 'internal server error' });
    }
}

export async function getmyfriends(req, res) {
    try {
        const user = await User.findById(req.user.id).select('friends')
        .populate('friends', 'Fullname profilePic nativelanguage learningLanguage')
        res.status(200).json(user.friends);
    } catch (err) {
        console.log('error in getmyfriends:', err);
        res.status(400).json({message:'internal server error'})
    }
}

export async function sendfriendrequest(req, res) {
    try {
        const myId = req.user.id;
        const {id: recipientId} = req.params;

        console.log('Sending friend request:', {
            sender: myId,
            recipient: recipientId
        });

        if(myId === recipientId) {
            return res.status(400).json({message:"you can't send friend request to yourself"});
        }

        const recipient = await User.findById(recipientId);
        if(!recipient){
            console.log('Recipient not found:', recipientId);
            return res.status(404).json({message:'Recipient not found'});
        }

        if(recipient.friends.includes(myId)){
            console.log('Users are already friends');
            return res.status(409).json({message:'you are already friend with this user'});
        }

        const existingrequest = await friendrequest.findOne({
            $or:[
                {sender: myId, recipient: recipientId}, 
                {sender: recipientId, recipient: myId}
            ],
        });

        if(existingrequest){
            console.log('Friend request already exists:', existingrequest);
            return res.status(409).json({message:'a friend request already exists'});
        }

        const newRequest = await friendrequest.create({
            sender: myId,
            recipient: recipientId,
        });

        console.log('Created new friend request:', newRequest);

        // Get sender's full user data for the notification
        const sender = await User.findById(myId).select('-password');
        if (!sender) {
            console.error('Sender not found after creating friend request');
            return res.status(500).json({message:'Error creating friend request'});
        }

        // Emit socket event to notify recipient
        const io = req.app.get('io');
        if (io) {
            console.log('Emitting friend request event to recipient:', recipientId);
            io.to(recipientId).emit('friendRequest', {
                type: 'friendRequest',
                request: newRequest,
                sender: sender
            });
        } else {
            console.error('Socket.io not available for friend request notification');
        }

        res.status(201).json(newRequest);
    } catch (err) {
        console.error('Error in sendfriendrequest:', err);
        res.status(500).json({message:'internal server error'});
    }
}

export async function acceptfriendrequest(req,res){
    try {
        const {id:requestId} = req.params

        const friendRequest = await friendrequest.findById(requestId);

        if(!friendRequest){
            return res.status(400).json({message:"friend request not found"});
        }

        if(friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({message:'you are not authorized to accept this friend request'});
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        // add each user to other's friends array
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: {friends: friendRequest.recipient},
        });

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: {friends: friendRequest.sender},
        });
        res.status(200).json({message:'friend request accepted'});
    } catch (err) {
        console.log('error in acceptfriendrequest:', err);
        return res.status(400).json({message:'internal server error'});
    }
}

export async function getincomingfriendrequest(req, res) {
    try {
        const userId = req.user._id;
        console.log('Getting friend requests for user:', userId);

        // Get incoming friend requests
        const incomingReqs = await friendrequest.find({
            recipient: userId,
            status: 'pending'
        }).populate('sender', 'Fullname profilePic nativelanguage learningLanguage bio location');

        console.log('Found incoming requests:', JSON.stringify(incomingReqs, null, 2));

        // Get accepted friend requests
        const acceptedReqs = await friendrequest.find({
            $or: [
                { sender: userId, status: 'accepted' },
                { recipient: userId, status: 'accepted' }
            ]
        }).populate('sender', 'Fullname profilePic nativelanguage learningLanguage bio location')
          .populate('recipient', 'Fullname profilePic nativelanguage learningLanguage bio location');

        console.log('Found accepted requests:', JSON.stringify(acceptedReqs, null, 2));

        // Log the query conditions for debugging
        console.log('Query conditions:', {
            incoming: {
                recipient: userId,
                status: 'pending'
            },
            accepted: {
                $or: [
                    { sender: userId, status: 'accepted' },
                    { recipient: userId, status: 'accepted' }
                ]
            }
        });

        const response = {
            incomingReqs,
            acceptedReqs
        };

        console.log('Sending response:', JSON.stringify(response, null, 2));
        res.status(200).json(response);
    } catch (err) {
        console.error('Error in getincomingfriendrequest:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getoutgoingfriendrequest(req, res) {
    try {
        const outgoingreqs = await friendrequest.find({
            sender: req.user.id,
            status: 'pending', 
        }).populate('recipient', 'Fullname profilePic nativelanguage learningLanguage bio location')
          .sort({ createdAt: -1 });

        console.log('Outgoing friend requests:', outgoingreqs);

        res.status(200).json(outgoingreqs);
    } catch (err) {
        console.error('Error in getoutgoingfriendrequest:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}