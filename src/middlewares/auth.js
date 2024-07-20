import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const isLoggedIn = async(req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(401).json({success: false, message: "Invalid Token or No Token Provided"});
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token
    if(token){
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if(err){
                res.status(403).json({success: false, message: "Invalid Token"})
            }else{
                req.user = decoded
                console.log(decoded);
                next();
            }
        })
    }else{
        res.status(401).json({success: false, message: "You are not authenticated"})
    }
}

export const isAdmin = async(req, res, next) => {
    try {
        const userId = req.user._id;

        const user = await User.findById({_id: userId})
        console.log(user.role)

        if(!user){
            return res.status(404).json({success: false, message: "User not found"})
        }
        // check users role
        if(user.role === 1){
            next();
        }else{
            return res.status(403).json({success: false, message: "Unauthorized user"})
        }

        
    } catch (err) {
        console.log(err);
        res.status(500).json({success: false, message: "Error checking admin"})
    }
}