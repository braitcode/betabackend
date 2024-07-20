import mongoose from "mongoose"

export const connectDB = (url) => {
    mongoose
    .connect(url).then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('Error connecting to MongoDB', err.message))
}

