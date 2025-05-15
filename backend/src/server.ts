// src/server.ts
import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from './config/passport'; // Passport global instance
import connectDB from './config/db';
import './config/passport'; // Important: This executes the passport configuration

import authRoutes from './routes/authRoutes';
import conversionRoutes from './routes/conversionRoutes';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app: Application = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL, // Client URL from .env
  credentials: true, // Important for cookies/sessions if used, though JWT is token-based
}));
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: false })); // Body parser for URL-encoded data

// Passport middleware initialize (no session needed for JWT strategy with Google)
app.use(passport.initialize());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', conversionRoutes);

// Simple route for base URL
app.get('/', (req: Request, res: Response) => {
  res.send('Gasoil Management API (Backend in CommonJS) is running...');
});

const PORT: string | number = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Optional: Export app for testing purposes (not strictly necessary for running)
// export default app; // For ESM style tests
// module.exports = app; // For CJS style tests