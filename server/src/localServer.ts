// server/src/localServer.ts (for local development ONLY)
import app from './server'; // Import the configured app
import dotenv from 'dotenv';

dotenv.config(); // Ensure .env is loaded for localServer too

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running locally on http://localhost:${PORT}`));