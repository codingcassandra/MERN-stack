const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          user = email ? await User.findOne({ email }) : null;

          if (user) {
            user.googleId = profile.id;
            user.isVerified = true;
            await user.save();
          } else {
            user = await User.create({
              googleId: profile.id,
              firstName: profile.name?.givenName || profile.displayName || "Google",
              lastName: profile.name?.familyName || "User",
              email,
              isVerified: true,
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
