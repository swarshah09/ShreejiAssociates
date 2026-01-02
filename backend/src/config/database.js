import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Use global connection to prevent multiple connections (important for serverless/cold starts)
let cachedConnection = global.mongoose;

if (!cachedConnection) {
  cachedConnection = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // If we have a cached connection, return it (prevents reconnection on hot reload/cold starts)
    if (cachedConnection.conn) {
      return cachedConnection.conn;
    }

    // If no promise exists, create a new connection
    if (!cachedConnection.promise) {
      const opts = {
        // MongoDB connection options for better performance
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        // Connection pooling settings for better performance
        maxPoolSize: 10, // Maximum number of connections in the pool
        minPoolSize: 2, // Minimum number of connections to maintain
        maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
        bufferCommands: false, // Disable mongoose buffering
        bufferMaxEntries: 0, // Disable mongoose buffering
      };

      cachedConnection.promise = mongoose.connect(mongoURI, opts).then((mongoose) => {
        return mongoose;
      });
    }

    try {
      cachedConnection.conn = await cachedConnection.promise;
    } catch (e) {
      cachedConnection.promise = null;
      throw e;
    }

    console.log(`✅ MongoDB Connected: ${cachedConnection.conn.connection.host}`);
    console.log(`📊 Database: ${cachedConnection.conn.connection.name}`);
    
    return cachedConnection.conn;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;

