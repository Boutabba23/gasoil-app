// src/scripts/seedConversionTable.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path'; // To resolve path to .env

import connectDB from '../config/db'; // Adjust path based on where seed script is run from
import ConversionTableEntry from '../models/ConversionTableEntry'; // Adjust path

// Load .env file from the root of the 'backend' directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


// IMPORTANT: Populate this array with your ACTUAL conversion data
// Every cm from 0 to 300 should ideally have an entry for precision.
// These are placeholder values.
const seedData = [
  { cm: 0, litres: 0 },
  { cm: 10, litres: 250 }, // Fictional
  { cm: 20, litres: 550 },
  // ... many more entries ...
  { cm: 135, litres: 2450 }, // Example from prompt
  // ... many more entries ...
  { cm: 290, litres: 49500 },
  { cm: 300, litres: 50000 }, // Full capacity
];

const generatedData: { cm: number, litres: number }[] = [];

// Ensure all 301 entries (0cm to 300cm) are present or generate them linearly (APPROXIMATION)
// THIS IS A VERY ROUGH APPROXIMATION. REPLACE WITH ACTUAL TANK CALIBRATION DATA.
if (seedData.length < 301) {
  console.warn("Conversion table data is sparse. Generating approximate values.");
  console.warn("FOR PRODUCTION: PLEASE PROVIDE AN ACCURATE CALIBRATION TABLE FOR YOUR TANK.");
  
  let lastKnownGoodIndex = -1;
  for (let i = 0; i <= 300; i++) {
    const existingEntry = seedData.find(entry => entry.cm === i);
    if (existingEntry) {
      generatedData.push(existingEntry);
      // Find the index in seedData to use for interpolation if next values are missing
      const currentSeedIndex = seedData.indexOf(existingEntry);
      if(currentSeedIndex > lastKnownGoodIndex) {
        lastKnownGoodIndex = currentSeedIndex;
      }

    } else {
      // Simple linear interpolation if surrounded by known points from seedData
      // Or extrapolate from the last known point
      let prevEntry = seedData[lastKnownGoodIndex];
      let nextEntry = seedData.find((e, idx) => e.cm > i && idx > lastKnownGoodIndex);

      if (prevEntry && nextEntry) {
          const slope = (nextEntry.litres - prevEntry.litres) / (nextEntry.cm - prevEntry.cm);
          const estimatedLitres = prevEntry.litres + slope * (i - prevEntry.cm);
          generatedData.push({ cm: i, litres: Math.max(0, Math.round(estimatedLitres)) });
      } else if (prevEntry) { // Extrapolate from last known
          const litresPerCm = prevEntry.cm > 0 ? (prevEntry.litres / prevEntry.cm) : (50000/300) ; // rough if cm=0
          const estimatedLitres = prevEntry.litres + litresPerCm * (i - prevEntry.cm);
          generatedData.push({ cm: i, litres: Math.max(0, Math.min(50000, Math.round(estimatedLitres))) });
      } else {
          // Fallback to very basic linear scaling if no prior data
          generatedData.push({ cm: i, litres: Math.round((i / 300) * 50000) });
      }
    }
  }
} else {
  generatedData.push(...seedData);
}


const importData = async () => {
  await connectDB(); // Ensure DB is connected
  try {
    await ConversionTableEntry.deleteMany({}); // Clear existing data
    await ConversionTableEntry.insertMany(generatedData);
    console.log('Conversion table data imported successfully!');
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error importing conversion table data:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

const destroyData = async () => {
  await connectDB();
  try {
    await ConversionTableEntry.deleteMany({});
    console.log('Conversion table data destroyed!');
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error destroying conversion table data:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

if (process.argv.includes('-d')) {
  destroyData();
} else {
  importData();
}