import { generateStreamToken, upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";

export async function getStreamToken(req, res) {
    try {
        console.log('Generating stream token for user:', req.user.id);
        const token = generateStreamToken(req.user.id);
        console.log('Stream token generated successfully');
        res.status(200).json({ token });
    } catch (err) {
        console.error('Error in getStreamToken:', {
            error: err.message,
            stack: err.stack,
            userId: req.user?.id
        });
        res.status(500).json({ 
            message: 'Failed to generate stream token',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
}

export async function createStreamUser(req, res) {
    try {
        const { userId } = req.body;
        
        // Find the user in our database
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create/update the user in Stream
        await upsertStreamUser({
            id: user._id.toString(),
            name: user.Fullname,
            Image: user.profilePic || ''
        });

        res.status(200).json({ message: 'Stream user created/updated successfully' });
    } catch (err) {
        console.error('Error in createStreamUser:', err);
        res.status(500).json({ message: 'Failed to create/update Stream user' });
    }
}