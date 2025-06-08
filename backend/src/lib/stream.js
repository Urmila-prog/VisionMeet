import { StreamChat } from 'stream-chat';
import 'dotenv/config'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug logging for environment and file paths
console.log('Current directory:', __dirname);
console.log('Parent directory:', path.dirname(__dirname));
console.log('Root directory:', path.dirname(path.dirname(__dirname)));

// Log all environment variables (excluding sensitive data)
console.log('All environment variables:', Object.keys(process.env));

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

// Debug logging
console.log('Environment variables:', {
    STREAM_API_KEY: apiKey ? 'Present' : 'Missing',
    STREAM_API_SECRET: apiSecret ? 'Present' : 'Missing',
    NODE_ENV: process.env.NODE_ENV
});

if (!apiKey || !apiSecret) {
    console.error('Stream API credentials are missing. Please check your .env file.');
    console.error('Current working directory:', process.cwd());
    throw new Error('Stream API credentials are not configured');
}

const serverClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async ({ id, name, Image }) => {
    try {
        await serverClient.upsertUser({
            id,
            name,
            image: Image || '/default-avatar.png'
        });
    } catch (error) {
        console.error('Error upserting stream user:', {
            error: error.message,
            userId: id,
            userName: name
        });
        throw error;
    }
};

export const generateStreamToken = (userId) => {
    try {
        if (!userId) {
            throw new Error('User ID is required to generate Stream token');
        }
        console.log('Generating Stream token for user:', userId);
        const token = serverClient.createToken(userId);
        console.log('Stream token generated successfully');
        return token;
    } catch (error) {
        console.error('Error generating Stream token:', {
            error: error.message,
            userId: userId
        });
        throw error;
    }
};