import mongoose from 'mongoose';

export const connectDB = (url) => {
  mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase server selection timeout to 30 seconds
      socketTimeoutMS: 45000, // Set socket timeout to 45 seconds
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('Error connecting to MongoDB', err.message));
};
