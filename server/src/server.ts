// server/src/server.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from './config/passport';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import conversionRoutes from './routes/conversionRoutes';
import path from 'path'; // For serving static files if backend also serves frontend (not the Vercel primary way)

dotenv.config();

const app = express(); // Create the app instance

// Connect to Database (do this early)
connectDB();

// Middlewares                                                        
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
            ? process.env.VERCEL_CLIENT_URL // Your deployed frontend URL
            : process.env.CLIENT_URL,    // http://localhost:xxxx for local dev
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', conversionRoutes);

// --- Vercel will handle serving static frontend assets directly ---
// --- You usually don't need this part for Vercel deployments if client is separate Vercel output ---
// // Serve frontend in production (if backend was handling this, which Vercel will do differently)
if (process.env.NODE_ENV === 'production') {
  // Assuming your client app builds to '../client/dist' relative to 'server/dist'
  const clientBuildPath = path.resolve(__dirname, '../../client/dist');
  console.log('Serving static files from:', clientBuildPath);
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => res.sendFile(path.resolve(clientBuildPath, 'index.html')));
} else {
  app.get('/', (req, res) => {
    res.send('API is running in development...');
  });
}


// Export the app for Vercel serverless function
// The listening part (app.listen) will only be for local development
// Vercel handles starting the server in its serverless environment.
export default app;

// Start server only if not in Vercel environment (for local development)
// Vercel sets a `VERCEL` environment variable.
// if (!process.env.VERCEL) { // Vercel sets VERCEL env var
//  const PORT = process.env.PORT || 5000;
//  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
//}
// A common pattern for local dev script (e.g. in server/package.json -> "start": "node dist/server.js")
// might involve a separate entry point for local that calls listen.
// For Vercel, it just needs the exported 'app'.