// server/src/types/express/index.d.ts
import { IUser } from '../../models/User'; // Adjust path to your IUser interface

declare global {
  namespace Express {
    export interface User extends IUser {} // Or simply export interface User extends IUser {} without the export if it's not recognized as a global augmentation
    export interface Request {
      user?: User; // Now req.user will be typed as your IUser
    }
  }
}

// You might also see a slightly different augmentation structure in some examples:
// declare namespace Express {
//   export interface Request {
//     user?: IUser; // Or whatever your user type is
//   }
// }
// The key is to tell TypeScript what `Express.Request.user` should be.