import dotenv from 'dotenv';
dotenv.config(); // Load environment variables first

import express from 'express';
import cors from 'cors';
import passport from './config/passport'; // Your Passport configuration
import connectDB from './config/db';

// 👇 Import using default import syntax
import authRoutes from './routes/authRoutes';
import conversionRoutes from './routes/conversionRoutes'; // This was the problematic line

const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Passport Middleware (initialize only, no session if using JWTs for app auth)
app.use(passport.initialize());

// API Routes
app.use('/api/auth', authRoutes); // Mount the auth router
app.use('/api/data', conversionRoutes); // Mount the conversion data router

app.get('/', (req, res) => {
  res.send('API de gestion de gasoil démarrée avec succès!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(
  `Serveur démarré en mode ${process.env.NODE_ENV || 'development'} sur le port ${PORT}`
));