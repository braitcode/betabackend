import mongoose from "mongoose";

// Create user schema
const {Schema} = mongoose;

// Define the exact schema that contains the information you need
const categorySchema = new Schema(
    {
        name:{
            type: String,
            required: true,
            trim: true,
            maxLength: 32,
            unique: true,
        },
        slug:{
            type: String,
            unique: true,
            lowercase: true,
        }
    })

    export default mongoose.model("Category", categorySchema);