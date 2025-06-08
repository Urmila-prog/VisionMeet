import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectRoute = async(req, res, next) => {
    try {
        console.log('Auth middleware - Request headers:', {
            cookies: req.cookies,
            headers: req.headers
        });

        // Check for token in cookies or Authorization header
        const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
        console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');

        if(!token) {
            console.log('No token provided in request');
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized - no token provided' 
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            console.log('Auth middleware - Decoded token:', {
                userId: decoded.userId,
                exp: decoded.exp
            });

            if(!decoded) {
                console.log('Invalid token format');
                return res.status(401).json({ 
                    success: false,
                    message: 'Invalid token format' 
                });
            }

            const user = await User.findById(decoded.userId).select('-password');
            console.log('Auth middleware - User found:', user ? 'Yes' : 'No');

            if(!user) {
                console.log('User not found for token:', decoded.userId);
                return res.status(401).json({ 
                    success: false,
                    message: 'User not found' 
                });
            }

            // Set the full user object in the request
            req.user = user;
            console.log('Auth middleware - User set in request:', {
                id: user._id,
                email: user.email,
                Fullname: user.Fullname
            });

            next();
        } catch (jwtError) {
            console.log('JWT verification error:', jwtError.message);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid or expired token' 
            });
        }
    } catch(err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error during authentication' 
        });
    }
};
