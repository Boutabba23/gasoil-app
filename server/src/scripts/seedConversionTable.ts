// server/src/scripts/seedConversionTable.ts
import dotenv from 'dotenv';
// Adjust paths if your file structure for config/db and models is different
import connectDB from '../config/db';
import  seedData  from '../scripts/seed';
import ConversionTableEntry from '../models/ConversionTableEntry';

// Make sure dotenv can find your .env file. If seed script is in server/src/scripts
// and .env is in server/, then this relative path is correct.
dotenv.config({ path: '../../../.env' }); // Go up from src/scripts to server/ then find .env
                                      // Or more robustly:
// import path from 'path';
// dotenv.config({ path: path.resolve(process.cwd(), '.env') }); // if .env is in the dir you run the script from (server/)


// =======================================================================
// === IMPORTANT: REPLACE THIS WITH YOUR ACTUAL CONVERSION TABLE DATA ===
// === Every cm from 0 to 300 should ideally have an entry.           ===
// =======================================================================

// =======================================================================

const importData = async () => {
  try {
    // Make sure MONGODB_URI is loaded correctly by dotenv
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not defined. Ensure .env file is loaded correctly.');
      process.exit(1);
    }
    await connectDB(); // connectDB should handle the MONGODB_URI from process.env

    await ConversionTableEntry.deleteMany({}); // Clear existing data
    console.log('Existing conversion table entries deleted.');

    // Validate data before insertion (optional but good)
    for (const entry of seedData) {
        if (typeof entry.cm !== 'number' || typeof entry.litres !== 'number' || entry.cm < 0 || entry.cm > 300 || entry.litres < 0) {
            console.error(`Invalid data found: cm=${entry.cm}, litres=${entry.litres}. Skipping.`);
            // continue; // Or throw an error to stop the seed
        }
    }

    await ConversionTableEntry.insertMany(seedData);
    console.log(`Successfully imported ${seedData.length} entries into conversionTable.`);
    process.exit(0); // Exit successfully
  } catch (error) {
    console.error('Error during data import:', error);
    process.exit(1); // Exit with error
  }
};

const destroyData = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not defined.');
      process.exit(1);
    }
    await connectDB();
    await ConversionTableEntry.deleteMany({});
    console.log('Conversion table data destroyed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during data destruction:', error);
    process.exit(1);
  }
};

// Script execution logic
if (process.argv.includes('-d')) { // Check if '-d' argument is present
  console.log('Attempting to destroy conversion table data...');
  destroyData();
} else {
  console.log('Attempting to import conversion table data...');
  importData();
}