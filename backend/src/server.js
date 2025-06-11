import express from "express";
import "dotenv/config";
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import net from 'net';
import fs from 'fs';

import authRoutes from "./routes/auth.js";
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js'
import { connectDB } from "./lib/lib.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple possible locations for .env file
const possibleEnvPaths = [
    path.resolve(__dirname, '../.env'),           // backend/.env
    path.resolve(__dirname, '../../.env'),        // root/.env
    path.resolve(process.cwd(), '.env'),          // current directory/.env
    path.resolve(process.cwd(), '../.env')        // parent directory/.env
];

let envLoaded = false;
for (const envPath of possibleEnvPaths) {
    console.log('Trying to load .env from:', envPath);
    if (fs.existsSync(envPath)) {
        console.log('Found .env file at:', envPath);
        const result = config({ path: envPath });
        if (!result.error) {
            envLoaded = true;
            console.log('Successfully loaded .env from:', envPath);
            break;
        } else {
            console.error('Error loading .env from', envPath, ':', result.error);
        }
    }
}

if (!envLoaded) {
    console.error('Could not find or load .env file in any of the expected locations');
}

console.log('Current working directory:', process.cwd());
console.log('Environment variables loaded:', {
    STREAM_API_KEY: process.env.STREAM_API_KEY ? 'Present' : 'Missing',
    STREAM_API_SECRET: process.env.STREAM_API_SECRET ? 'Present' : 'Missing',
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY ? 'Present' : 'Missing',
    MONGO_URI: process.env.MONGO_URI ? 'Present' : 'Missing'
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['https://visionmeet.onrender.com', 'http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Accept']
    }
});

// Function to check if a port is in use
const isPortInUse = (port) => {
    return new Promise((resolve) => {
        const server = net.createServer()
            .once('error', (err) => {
                console.log(`Port ${port} is in use: ${err.message}`);
                resolve(true);
            })
            .once('listening', () => {
                server.close();
                console.log(`Port ${port} is available`);
                resolve(false);
            })
            .listen(port);
    });
};

// Function to find an available port
const findAvailablePort = async (startPort, maxAttempts = 10) => {
    let port = startPort;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        if (!(await isPortInUse(port))) {
            return port;
        }
        console.log(`Port ${port} is in use, trying next port...`);
        port++;
        attempts++;
    }
    
    throw new Error(`Could not find an available port after ${maxAttempts} attempts`);
};

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'https://visionmeet.onrender.com',
            'http://localhost:3000',
            'http://localhost:5173', // Vite dev server
            'http://127.0.0.1:5173'  // Vite dev server alternative
        ];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            console.log('Request with no origin - allowing');
            return callback(null, true);
        }
        
        // Log all incoming origins for debugging
        console.log('Incoming request origin:', origin);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('CORS blocked request from origin:', origin);
            return callback(new Error('Not allowed by CORS'), false);
        }
        
        console.log('CORS allowed request from origin:', origin);
        return callback(null, true);
    },
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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Root endpoint
app.get('/', (req, res) => {
    const serverInfo = {
        status: 'online',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        endpoints: {
            auth: {
                login: '/api/auth/login',
                signup: '/api/auth/signup',
                logout: '/api/auth/logout',
                me: '/api/auth/me'
            },
            users: {
                profile: '/api/users/profile',
                search: '/api/users/search',
                friends: '/api/users/friends'
            },
            chat: {
                token: '/api/chat/token',
                messages: '/api/chat/messages'
            }
        },
        server: {
            host: req.headers.host,
            protocol: req.protocol,
            origin: req.headers.origin
        }
    };
    
    console.log('Root endpoint hit:', {
        headers: req.headers,
        cookies: req.cookies,
        origin: req.headers.origin
    });
    
    res.json(serverInfo);
});

// Test endpoint
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

// Start the server
const startServer = async () => {
    try {
        // On Render, use the PORT provided by the platform
        // In development, use our port finding logic
        const port = process.env.PORT || await findAvailablePort(5003);
        
        if (!port) {
            throw new Error('No port available. Please check your environment configuration.');
        }

        // Log environment information
        console.log('Environment:', {
            NODE_ENV: process.env.NODE_ENV,
            PORT: port,
            RENDER: process.env.RENDER ? 'true' : 'false',
            ENV: process.env.RENDER ? 'production' : 'development'
        });

        httpServer.listen(port, '0.0.0.0', () => {
            console.log('=================================');
            console.log(`🚀 Server is running on port ${port}`);
            if (!process.env.RENDER) {
                console.log(`📝 Test the server with: http://localhost:${port}/test`);
            }
            console.log(`🌐 Frontend is being served from: ${frontendPath}`);
            console.log('=================================');
        });

        // Handle server errors
        httpServer.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${port} is already in use.`);
                if (process.env.RENDER) {
                    console.error('On Render: Port conflict detected. Please remove any PORT environment variable from your Render service configuration.');
                } else {
                    console.error('Please try a different port or stop the process using this port.');
                }
                process.exit(1);
            } else {
                console.error('Server error:', error);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

// Connect to MongoDB
connectDB();

// Start the server
startServer();