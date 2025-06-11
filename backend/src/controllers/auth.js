import { upsertStreamUser } from '../lib/stream.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function signup(req,res){
    
    const {Fullname, email, password} = req.body;
    try{
       console.log('Signup attempt with:', { email, Fullname });
       
       if(!email||!password||!Fullname){
        return res.status(400).json({message: 'all fields are required'});
       }

       if(password.length < 6){
        return res.status(400).json({message: 'password must be atleast 6 characters'});
       }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if(!emailRegex.test(email)){
        return res.status(400).json({message: 'invalid email format'});
       }

       const existingUser = await User.findOne({email});
       console.log('Existing user check:', existingUser ? 'Found' : 'Not found');
       
       if(existingUser){
            return res.status(400).json({message: 'email already exist, use different email'});
        }

        const idx = Math.floor(Math.random()*100) +1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`

        // Hash password before creating user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user with hashed password
        const newUser = new User({
            email: email,
            Fullname: Fullname,
            password: hashedPassword,
            profilePic: randomAvatar
        });

        // Save the user
        await newUser.save();
        
        console.log('New user created successfully:', {
            id: newUser._id,
            email: newUser.email,
            Fullname: newUser.Fullname
        });

        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET_KEY, {
            expiresIn: '7d'
        });
        
        console.log('Setting JWT cookie for new user:', {
            userId: newUser._id,
            token: token.substring(0, 20) + '...'
        });
        
        res.cookie('jwt', token, {
            maxAge: 7*24*60*60*1000,
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
            domain: process.env.RENDER ? '.render.com' : undefined
        });
         res.status(201).json({
             success: true, 
             user: newUser,
             token: token
         });

    }catch(err){
        console.log('Signup error:', err);
        res.status(500).json({message:err.message})
    }
}


export async function login(req, res) {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '7d' }
        );

        // Create or update Stream user
        try {
            console.log('Creating/updating Stream user:', {
                id: user._id.toString(),
                name: user.Fullname,
                image: user.profilePic || ''
            });
            
            await upsertStreamUser({
                id: user._id.toString(),
                name: user.Fullname,
                Image: user.profilePic || ''
            });
            
            console.log('Stream user created/updated successfully');
        } catch (err) {
            console.error('Error creating/updating Stream user:', err);
            // Don't throw the error, just log it
        }

        // Remove password from response
        const userResponse = {
            _id: user._id,
            email: user.email,
            Fullname: user.Fullname,
            profilePic: user.profilePic,
            isOnboarded: user.isOnboarded
        };

        console.log('Login successful for user:', {
            id: user._id,
            email: user.email,
            isOnboarded: user.isOnboarded
        });

        // Set cookie and send response
        res.cookie('jwt', token, {
            maxAge: 7*24*60*60*1000,
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
            domain: process.env.RENDER ? '.render.com' : undefined
        });

        res.status(200).json({
            success: true, 
            user: userResponse,
            token: token
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: err.message });
    }
}

export function logout(req,res){
     res.clearCookie('jwt')
     res.status(200).json({success:true, message:'logout successfully'});
}

export async function onboard(req, res) {
     try {
        const userId = req.user._id

        const {Fullname, bio, nativelanguage, learningLanguage, location} = req.body

        if(!Fullname || !bio || !nativelanguage || !learningLanguage || !location) {
            return res.status(400).json({
                message: 'All fields are required',
                missingFields: [
                    !Fullname && 'Fullname',
                    !bio && 'Bio',
                    !nativelanguage && 'Native Language',
                    !learningLanguage && 'Learning Language',
                    !location && 'Location',
                ].filter(Boolean),
            });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            Fullname,
            bio,
            nativelanguage, 
            learningLanguage,
            location,
            isOnboarded: true,
        }, {new: true}) 

        if(!updatedUser) return res.status(404).json({message: 'User not found'})

        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.Fullname,
                image: updatedUser.profilePic || "",
            })
            console.log(`Stream user updated after onboarding for ${updatedUser.Fullname}`);
        } catch (streamErr) {
            console.log("Error updating stream user during onboarding:", streamErr.message);
        }

        res.status(200).json({success: true, user: updatedUser});
     } catch (err) {
        console.error('Onboarding error:', err);
        res.status(500).json({message: 'Internal server error'})
     }
}