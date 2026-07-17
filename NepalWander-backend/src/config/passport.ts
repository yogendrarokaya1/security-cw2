import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/User.model";
import { ENV } from "./env";
import { UserRole, AccountStatus } from "../types";
import { logAuth } from "../utils/logger.util";

passport.use(
  new GoogleStrategy(
    {
      clientID: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      callbackURL: ENV.GOOGLE_CALLBACK_URL,
    },
    async (
      _accessToken,
      _refreshToken,
      profile,
      done
    ) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(
            new Error(
              "No email found in Google profile"
            ),
            undefined
          );
        }

        // Check if user already exists
        let user = await UserModel.findOne({
          $or: [{ googleId: profile.id }, { email }],
        });

        if (user) {
          // Link googleId if user registered locally
          if (!user.googleId) {
            user.googleId = profile.id;
            user.authProvider = "google";
            await user.save();
          }

          logAuth("GOOGLE_LOGIN", {
            userId: user._id.toString(),
            email: user.email,
            success: true,
          });

          return done(null, user);
        }

        // Create new user from Google profile
        const newUser = await UserModel.create({
          firstName:
            profile.name?.givenName || "Google",
          lastName:
            profile.name?.familyName || "User",
          email,
          password: `google_oauth_${profile.id}_${Date.now()}`,
          googleId: profile.id,
          authProvider: "google",
          role: UserRole.TOURIST,
          accountStatus: AccountStatus.APPROVED,
          isVerified: true,
          isActive: true,
          profileImage: profile.photos?.[0]?.value,
        });

        logAuth("GOOGLE_REGISTER", {
          userId: newUser._id.toString(),
          email: newUser.email,
          success: true,
        });

        return done(null, newUser);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;