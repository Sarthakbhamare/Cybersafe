import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config"; 

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const app = express();

app.use(express.json({ limit: "5mb" })); 
app.use(helmet()); 
// CORS configuration
const isProd = process.env.NODE_ENV === 'production';
const allowedOriginEnv = process.env.CLIENT_URL; // e.g., https://yourapp.com
const lanPatterns = [
  /^http:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/,
  /^http:\/\/192\.168\.\d+\.\d+(?::\\d+)?$/,
  /^http:\/\/10\.\d+\.\d+\.\d+(?::\\d+)?$/,
  /^http:\/\/172\.(1[6-9]|2\\d|3[0-1])\.\d+\.\d+(?::\\d+)?$/
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!isProd) return callback(null, true); // reflect any origin in development
    if (allowedOriginEnv && origin === allowedOriginEnv) return callback(null, true);
    if (lanPatterns.some((re) => re.test(origin))) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions)); 
app.use(morgan("tiny")); 


connectDB();

app.use("/api/auth", authRoutes); 
app.use("/api/stories", storyRoutes); 


app.get("/", (req, res) => res.send({ ok: true, message: "QuickFind API" }));


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
