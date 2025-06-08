import express from "express";
import "dotenv/config";
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from "./routes/auth.js";
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js'
import { connectDB } from "./lib/lib.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const result = config({ path: path.resolve(__dirname, '../.env') });

if (result.error) {
    console.error('Error loading .env file:', result.error);
}

console.log('Environment loaded from:', path.resolve(__dirname, '../.env'));
console.log('Current working directory:', process.cwd());

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['https://visionmeet.onrender.com', /^http:\/\/localhost:\d+$/],
        credentials: true
    }
});

const PORT = 5003;

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: ['https://visionmeet.onrender.com', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user's room for private messages
    socket.on('join', (userId) => {
        if (!userId) {
            console.error('Invalid userId provided for socket join');
            return;
        }
        
        // Leave any existing rooms
        socket.rooms.forEach(room => {
            if (room !== socket.id) {
                socket.leave(room);
            }
        });

        // Join the user's room
        socket.join(userId);
        console.log(`User ${userId} joined their room. Socket ID: ${socket.id}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    // Error handling
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Make io accessible to our routes
app.set('io', io);

// Test route - Add more detailed response
app.get('/test', (req, res) => {
    console.log('Test endpoint hit:', {
        headers: req.headers,
        cookies: req.cookies,
        origin: req.headers.origin
    });
    res.json({ 
        message: 'Server is working!',
        timestamp: new Date().toISOString(),
        status: 'ok'
    });
});

// Request logging middleware
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        url: req.url,
        body: req.body,
        headers: req.headers,
        cookies: req.cookies,
        origin: req.headers.origin
    });
    next();
});

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Serve static files from the frontend build directory
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Serve the frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start server
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Test the server with: http://localhost:${PORT}/test`);
    console.log(`Frontend is being served from: ${frontendPath}`);
});