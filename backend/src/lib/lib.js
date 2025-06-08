import mongoose from "mongoose";

export const connectDB = async ()=>{
    try{
    console.log('Attempting to connect to MongoDB with URI:', process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected successfully to: ${conn.connection.host}`);
    console.log('Database name:', conn.connection.name);
    console.log('Available collections:', await conn.connection.db.listCollections().toArray());
    } catch(err){
         console.log('MongoDB connection error:', err);
         process.exit(1);
    }
}