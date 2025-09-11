import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes';
import conversionRoutes from './routes/conversionRoutesMinimal';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS
const clientDevUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const allowedOrigins = [clientDevUrl];

if (process.env.NODE_ENV === 'production') {
  if (process.env.VERCEL_URL) {
    allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.DEPLOYED_CLIENT_URL) {
    allowedOrigins.push(process.env.DEPLOYED_CLIENT_URL);
  }
}

console.log("Allowed CORS origins:", allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', conversionRoutes);

app.get('/', (req, res) => {
  res.send('API de gestion de gasoil démarrée avec succès!');
});

app.listen(PORT, () => console.log(
  `Serveur démarré en mode ${process.env.NODE_ENV || 'development'} sur le port ${PORT}`
));

export default app;
