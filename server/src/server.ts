import dotenv from 'dotenv';
dotenv.config(); // Load environment variables first

import express from 'express';
import cors from 'cors';
import passport from './config/passport'; // Your Passport configuration
import connectDB from './config/db';

// 👇 Import using default import syntax
import authRoutes from './routes/authRoutes';
import conversionRoutes from './routes/conversionRoutes'; // This was the problematic line
// server/src/server.ts
// ...

const clientDevUrl = process.env.CLIENT_URL || 'http://localhost:3000'; // Your local React dev server
// Vercel sets VERCEL_URL (current deployment) and VERCEL_BRANCH_URL (preview deployments)
// You'll also have a production domain later.

const allowedOrigins = [clientDevUrl];
if (process.env.NODE_ENV === 'production') {
  if (process.env.VERCEL_URL) { // Base Vercel URL for current deployment (e.g., my-app-sha.vercel.app)
    allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.DEPLOYED_CLIENT_URL) { // Your custom production domain (set this in Vercel env vars)
    allowedOrigins.push(process.env.DEPLOYED_CLIENT_URL);
  }
} else { // Development
  // For local, could also allow Vercel CLI local emulation if used: http://localhost:SOME_VERCEL_PORT
}
console.log("Allowed CORS origins:", allowedOrigins);
const app = express();


app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests) for APIs or specific cases
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true 
}));
// ...

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


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(
  `Serveur démarré en mode ${process.env.NODE_ENV || 'development'} sur le port ${PORT}`
));

 export default app; // This is what Vercel's @vercel/node builder looks for
