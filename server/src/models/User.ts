import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document { // Document provides _id, and with timestamps: true, also createdAt/updatedAt
  googleId: string;
  displayName: string;
  email?: string;
  profilePicture?: string;
  // No need to explicitly declare createdAt/updatedAt if using { timestamps: true }
}

const UserSchema: Schema<IUser> = new Schema( // Typed Schema
  {
    googleId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true }, // sparse if optional but unique when present
    profilePicture: { type: String },
  },
  { timestamps: true } // This adds createdAt and updatedAt fields managed by Mongoose
);

export default mongoose.model<IUser>('User', UserSchema);