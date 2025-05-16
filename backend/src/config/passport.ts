// src/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile , VerifyCallback} from 'passport-google-oauth20';
import User, { IUser } from '../models/User'; // Assuming User model is defined
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  console.error('Google OAuth credentials are not fully configured in .env');
  process.exit(1);
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      //authOptions.prompt: 'select_account', // Forcing it here too
      // You might also experiment with 'consent' if 'select_account' doesn't work,
      // though 'select_account' is more appropriate for choosing an account.
      //prompt: 'consent select_account', // Can combine prompts
    },
 async (accessToken: string, refreshToken: string | undefined, profile: any, done: VerifyCallback) => { // Use any for profile or a more specific type
      console.log("Passport Google Strategy: Profile received:", profile.displayName, profile.id);      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
                    console.log("Passport Google Strategy: User found:", user.displayName);

          return done(null, user);
        }
        console.log("Passport Google Strategy: Creating new user.");

        // If user doesn't exist, create a new one
        const newUser: IUser = new User({
          googleId: profile.id,
          displayName: profile.displayName || "Utilisateur Google", // Fallback if displayName is not available
          email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : undefined,
          profilePicture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : undefined,
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        console.error('Error in Google OAuth Strategy:', error);
        done(error, false);
      }
    }
  )
);

export default passport;

// We are not using sessions with Passport for this JWT-based auth,
// so serializeUser and deserializeUser are not strictly needed if
// `passport.authenticate('google', { session: false })` is used.
// However, some Passport setups might still call them if not explicitly disabled.
// For JWT, the user info is typically encoded in the token, not a session.

// passport.serializeUser((user: any, done) => {
//   done(null, user.id); // Serialize by user's MongoDB _id
// });

// passport.deserializeUser(async (id: string, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });