// src/models/ConversionTableEntry.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IConversionTableEntry extends Document {
  cm: number;
  litres: number;
}

const ConversionTableEntrySchema: Schema = new Schema({
  cm: {
    type: Number,
    required: true,
    unique: true,
    min: 0,
    max: 300, // 3 meters = 300 cm
  },
  litres: {
    type: Number,
    required: true,
    min: 0,
  },
});

// Index for faster lookups by 'cm'
ConversionTableEntrySchema.index({ cm: 1 });

export default mongoose.model<IConversionTableEntry>(
  'ConversionTableEntry',
  ConversionTableEntrySchema,
  'conversionTable' // Explicit collection name
);