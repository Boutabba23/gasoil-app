// src/models/Conversion.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IConversion extends Document {
  userId: string; // Store Google User ID directly for simplicity or a ref to User model's _id
  value_cm: number;
  volume_l: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConversionSchema: Schema = new Schema(
  {
   userId: { type: String, required: true, index: true }, // Stores Google ID string
  value_cm: { type: Number, required: true },
  volume_l: { type: Number, required: true },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

export default mongoose.model<IConversion>('Conversion', ConversionSchema, 'conversions');