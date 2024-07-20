import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './src/db.config.js';
import cors from 'cors';
import authRouter from "./src/routes/auth.js";
import productRouter from "./src/routes/product.js"
import categoryRouter from "./src/routes/category.js";
import morgan from "morgan";

dotenv.config()

const app = express();
const port = process.env.PORT || 8080;
const dbUrl = process.env.MONGODB_URL;

// Connect to MongoDB
connectDB(dbUrl);

// Middleware
app.use(express.json());

// cors
let corsOptions = { 
    origin : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'], 
  } 
  app.use(cors(corsOptions));

  app.use(morgan("dev"));

  // Root route
app.get('/', (req, res) => {
    res.send('Welcome to my API');
  });

  // routers
app.use("/api/auth", authRouter)
app.use("/api/product", productRouter);
app.use("/api/category", categoryRouter)

  app.listen(port, (req, res) => {
    console.log(`Server running on port ${port}`)
  })