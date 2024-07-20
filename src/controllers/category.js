import slugify from "slugify";
import Category from "../models/category.js";

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if(!name){
            return res.status(400).json("Name is required")
        }

        const existingCategory = await Category.findOne({name});
        if(existingCategory){
            return res.status(401).json({success: false, message: "Category already exists"})
        }

        const category = await new Category ({name, slug: slugify(name) }).save()

        res.json({success: true, messaage: "Category created successfully", category})
    } catch (err) {
        console.log(err);
        res.status(500).json({success: false, message: "Internal Server Error", errMsg: err.message});
    }
}
export const getAllCategory = async (req, res) => {
    try {
        const category = await Category.find()
        res.json({success: true, message: "Categories fetched successfully", category})
    } catch (err) {
        res.status(500).json({success: false, message: err.message})
    }
}

export const getOneCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const category = await Category.findById(categoryId)
        if(!category){
            return res.status(404).json({success: false, message: "Category not found"})
        }
        res.json({success: true, message: "Category fetched successfully", category})
    } catch (err) {
        res.status(500).json({success: false, message: err.message})
    }
}
// function to update category
export const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const { categoryId } = req.params;

        // find the categoryById from the category
        const category = await Category.findById({_id: categoryId})
        if(!category){
            return res.status(404).json({success: false, message: "Category not found"})
        }

        // update the fields
        category.name = name || category.name
       

        // save the updatedCategory
        const updatedCategory = await category.save();
        res.json({success: true, message: "Category update successfully", updatedCategory})
    } catch (err) {
        console.log("Error updating category", err.message)
        res.status(500).json({success: false, error: "Internal server error", message: err.message})
    }
}
// function to delete category
export const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const category = await Category.deleteOne({_id: categoryId})
        if(!category){
            return res.status(404).json({success: false, message: "Category not found"})
        }
        res.json({success: true, message: "Category deleted successfully", category})
    } catch (err) {
        console.log("Error deleting category", err.message)
        res.status(500).json({success: false, error: "Internal server error", message: err.message})
    }
}