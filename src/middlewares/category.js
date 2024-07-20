import jwt from "jsonwebtoken";
import Category from "../models/category.js";

export const isLoggedIn = async(req, res, next) => {
    const categoryHeader = req.headers.authorization;
    if(!categoryHeader || !categoryHeader.startsWith("Bearer")){
        return res.status(401).json({success: false, message: "Invalid Token or No Token Provided"});
    }

    // Extract the token
    const token = categoryHeader.split(" ")[1];

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
        const categoryId = req.category._id;

        const category = await Category.findById({_id: categoryId})
        console.log(category.role)

        if(!category){
            return res.status(404).json({success: false, message: "Category not found"})
        }
        // check users role
        if(category.role === 1){
            next();
        }else{
            return res.status(403).json({success: false, message: "Unauthorized user"})
        }

        
    } catch (err) {
        console.log(err);
        res.status(500).json({success: false, message: "Error checking admin"})
    }
}