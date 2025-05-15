// src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  displayName: string;
  email?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      sparse: true, // Allows null/undefined and ensures uniqueness if present
    },
    profilePicture: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

export default mongoose.model<IUser>('User', UserSchema);