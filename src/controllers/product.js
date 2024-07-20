import slugify from "slugify"
import Product from "../models/product.js"
import { cloudinary } from "../helpers/cloudinary.config.js";



export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity } = req.body;
    const imageFiles = req.files;

    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const slug = slugify(name);
    let uploadedImages = [];

    if(imageFiles && imageFiles.length > 0) {
      uploadedImages = await Promise.all(
        imageFiles.map(async (file) => {
          try {
            const imageResult = await cloudinary.uploader.upload(file.path);
            return {
              url: imageResult.secure_url,
              imagePublicId: imageResult.public_id,
            };
          } catch (err) {
            console.error("Error uploading image to Cloudinary:", err);
            return {
              error: "Failed to upload image",
            };
          }
        })
      );
    }

    const newProduct = new Product({
      name,
      slug,
      description,
      price,
      category,
      quantity,
      images: uploadedImages,
    });

    await newProduct.save();

    // send email to user
    // const sub = "New Product Notification"
    // const msg = `A new product: ${newProduct.name} has been added to our product list`
    // await sendEmail("brightjohn489@gmail.com", sub, msg)

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ success: false, message: "Failed to create product", error: err });
  }
};

// get one product
export const getOneProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId)
        if(!product){
            return res.status(404).json({success: false, message: "Product not found"})
        }
        res.json({success: true, message: "Product fetched successfully", product})
    } catch (err) {
        res.status(500).json({success: false, message: err.message})
    }
}

// get product by slug
export const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const product = await Product.findOne({slug})
        if(!product){
            return res.status(404).json({success: false, message: "Product not found"})
        }
        res.json({success: true, message: "Product fetched successfully", product})
    } catch (error) {
        console.log("Error creating product", err.message);
        return res.status(500).json({success: false, error: "Internal server error", message: err.message})
    }
}

// function to delete product
export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.deleteOne({_id: productId})
        if(!product){
            return res.status(404).json({success: false, message: "Product not found"})
        }
        res.json({success: true, message: "Product deleted successfully", product})
    } catch (err) {
        console.log("Error deleting product", err.message)
        res.status(500).json({success: false, error: "Internal server error", message: err.message})
    }
}

// Get all products with pagination
export const getAllProducts = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      const products = await Product.find().skip(skip).limit(limit);
      const totalProducts = await Product.countDocuments();
  
      res.status(200).json({
        success: true,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        productCount: totalProducts,
        products,
      });
    } catch (err) {
      console.error("Error fetching all products:", err.message);
      res.status(500).json({ success: false, message: "Failed to fetch products", error: err.message });
    }
  };

  // get related products
  export const relatedProducts = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Find related products by tags, excluding the current product
        const relatedProducts = await Product.find({
            _id: { $ne: productId },
            $or: [
                // { tags: { $in: product.tags } },
                { name: new RegExp(product.name, 'i') },
                { description: new RegExp(product.description, 'i') }
            ]
        }).limit(10);

        res.status(200).json({ success: true, relatedProducts });
    } catch (err) {
        console.log("Error fetching related products:", err.message);
        res.status(500).json({ success: false, message: "Failed to fetch related products", error: err.message });
    }
};

// search products with pagination
export const searchProduct = async (req, res) => {
  const { term } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!term) {
      return res.status(400).json({ success: false, message: 'Search term is required' });
  }

  try {
      const searchRegex = new RegExp(term, 'i');
      const query = {
          isAvailable: true,
          $or: [
              { name: searchRegex },
              { description: searchRegex },
          ],
      };

      const products = await Product.find(query).skip(skip).limit(limit);
      const totalProducts = await Product.countDocuments(query);

      res.json({
          success: true,
          currentPage: page,
          productsFound: totalProducts,
          totalPages: Math.ceil(totalProducts / limit),
          products,
      });
  } catch (error) {
      console.log('Error searching products:', error);
      res.status(500).json({ success: false, message: 'Failed to search products', errMsg: error.message });
  }
};

// update products
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, price, category, quantity } = req.body;
    const imageFiles = req.files;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
   
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.quantity = quantity || product.quantity;

    if(name){
      const nameSlug = slugify(name)
      product.slug =  nameSlug || product.slug;

    }

    // Delete previously uploaded images from Cloudinary
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map(async (image) => {
          try {
            // Delete image from Cloudinary
            await cloudinary.uploader.destroy(image.imagePublicId);
          } catch (err) {
            console.error("Error deleting image from Cloudinary:", err);
          }
        })
      );
    }

    // Upload new images to Cloudinary
    let uploadedImages = [];

    if (imageFiles && imageFiles.length > 0) {
      uploadedImages = await Promise.all(
        imageFiles.map(async (file) => {
          try {
            const imageResult = await cloudinary.uploader.upload(file.path);
            return {
              url: imageResult.secure_url,
              imagePublicId: imageResult.public_id,
            };
          } catch (err) {
            console.error("Error uploading image to Cloudinary:", err);
            return {
              error: "Failed to upload image",
            };
          }
        })
      );
    }
    product.images = uploadedImages.length > 0 ? 
    uploadedImages : product.images;

    // Save updated product
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: product,
    });
  } catch (err) {
    console.error("Error updating product:", err.message);
    res.status(500).json({ success: false, message: "Error updating product", error: err.message });
  }
};