// server/src/types/express/index.d.ts

// Ensure this path is correct relative to this index.d.ts file
// From: server/src/types/express/index.d.ts
// To:   server/src/models/User.ts
import { IUser } from '../../models/User';

declare global {
  namespace Express {
    // Augment the User interface
    // This makes Express.User have the same shape as your IUser
    // which means types from @types/passport for Express.User will now include your fields.
    export interface User extends IUser {}

    // Augment the Request interface
    export interface Request {
      user?: User; // This now means req.user is of type (IUser properties) | undefined
    }
  }
}