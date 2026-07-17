import passport from "passport";
// @ts-ignore
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/User.model";
import { ENV } from "./env";
import { UserRole, AccountStatus } from "../types";
import { logAuth } from "../utils/logger.util";

passport.use(
  // @ts-ignore
  new GoogleStrategy(
    {
      clientID: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      callbackURL: ENV.GOOGLE_CALLBACK_URL,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: any,
      done: any
    ) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(
            new Error("No email found in Google profile"),
            false
          );
        }

        let user = await UserModel.findOne({
          $or: [{ googleId: profile.id }, { email }],
        });

        if (user) {
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

        const newUser = await UserModel.create({
          firstName: profile.name?.givenName || "Google",
          lastName: profile.name?.familyName || "User",
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
        return done(error, false);
      }
    }
  )
);

// @ts-ignore
passport.serializeUser((user: any, done: any) => {
  done(null, user._id.toString());
});

// @ts-ignore
passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;