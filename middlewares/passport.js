const passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

const User = require("../models/User");

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
        },
        async function (username, password, done) {
            try {
                const user = await User.findOne({ email: username }).lean();
                if (!user) {
                    return done(null, false, { message: "Incorrect email." });
                }
                if (!validPassword(user, password)) {
                    return done(null, false, {
                        message: "Incorrect password.",
                    });
                }

                if (user.status == false) {
                    return done(null, false, { message: "Account was ban." });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

function validPassword(user, password) {
    return bcrypt.compareSync(password, user.password);
}

passport.serializeUser(async function (user, done) {
    try {
        done(null, {
            email: user.email,
            name: user.name,
            address: user.address,
            phonenumber: user.phonenumber,
            id: user._id,
            status: user.status,
        });
    } catch (error) {
        done(error);
    }
});

passport.deserializeUser(async function (user, done) {
    try {
        // User.findOne({ email: id }, function (err, user) {
        //   done(err, user);
        // });
        done(null, user);
    } catch (error) {
        done(error);
    }
});


passport.use(
    new GoogleStrategy(
      {
        clientID: "70778912886-hanm0bmck1ftc20gjevk6313uo7duf0h.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: "http://localhost:5000/google/callback",
      },
      async function (accessToken, refreshToken, profile, next) {
        try {
          // Tìm hoặc tạo người dùng với thông tin từ profile
          const user = await User.findOneAndUpdate(
            { email: profile.emails[0].value },
            {
              name: profile.displayName,
              id: profile.id,
              email: profile.emails[0].value,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          return next(null, user);
        } catch (error) {
          return next(error);
        }
      }
    )
  );

  passport.use(
    new FacebookStrategy(
        {
            clientID: "894773335333012",
            clientSecret: "b57b9883d476cb61a30c48844178ccdb",
            callbackURL: "http://localhost:5000/facebook/callback",
            profileFields: [
                "id",
                "displayName",
                "name",
                "gender",
                "picture.type(large)",
                "email",
            ],
        },
        async function (accessToken, refreshToken, profile, done) {
            try {
                // Tìm hoặc tạo người dùng với thông tin từ profile
                const user = await User.findOneAndUpdate(
                    { facebookId: profile.id }, // Updated query field
                    {
                        name: profile.displayName,
                        // Update other fields as needed
                    },
                    { upsert: true, new: true } // Add options to create a new document if not found
                );

                return done(null, user);
            } catch (error) {
                console.error("Error in Facebook authentication:", error);
                return done(error);
            }
        }
    )
);
passport.use(
    new FacebookStrategy(
        {
            clientID: "894773335333012",
            clientSecret: "b57b9883d476cb61a30c48844178ccdb",
            callbackURL: "http://localhost:5000/facebook/callback",
            profileFields: [
                "id",
                "displayName",
                "name",
                "gender",
                "picture.type(large)",
                "email",
            ],
        },
        async function (accessToken, refreshToken, profile, done) {
            try {
                // Tìm hoặc tạo người dùng với thông tin từ profile
                const user = await User.findOneAndUpdate(
                    { facebookId: profile.id }, // Updated query field
                    {
                        name: profile.displayName,
                        // Update other fields as needed
                    },
                    { upsert: true, new: true } // Add options to create a new document if not found
                );

                return done(null, user);
            } catch (error) {
                console.error("Error in Facebook authentication:", error);
                return done(error);
            }
        }
    )
);



  
  //http://localhost:4000/github/callback
  // Github Client ID: f9c6f9dd79cd4a4ee5d6
  // Github Client Secrect: 0655a166930d9b0083784550a95791f35b3ec703
  
  passport.use(
    new GitHubStrategy(
      {
        clientID: "f9c6f9dd79cd4a4ee5d6",
        clientSecret: "0655a166930d9b0083784550a95791f35b3ec703",
        callbackURL: "http://localhost:5000/github/callback",
      },
      async function (accessToken, refreshToken, profile, next) {
        try {
            const user = await User.findOrCreate({ id: profile.id }, {
                name: profile.displayName || "",
                id: profile.id || "",
                email: profile.email,
            });
            return next(null, user);
        } catch (error) {
            return next(error);
        }
        }
    )
  );
  // I will Add Additional Features later

module.exports = passport;
