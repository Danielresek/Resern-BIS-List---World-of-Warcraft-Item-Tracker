const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("../models"); // Pass på at pathen stemmer med modellen din
const validator = require("validator");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ where: { email } });
          if (!user) {
            return done(null, false, {
              message: "Incorrect email or password",
            });
          }
          const isMatch = await bcrypt.compare(password, user.password_hash);
          if (!isMatch) {
            return done(null, false, {
              message: "Incorrect email or password",
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

// Registrer ny bruker
async function signup(req, res) {
  const { username, email, password } = req.body;

  // Sjekk om e-posten er gyldig
  if (!validator.isEmail(email)) {
    return res.status(400).send("Please enter a valid email address.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password_hash: hashedPassword,
    });
    req.session.userId = user.id;
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.redirect("/signup");
  }
}

// Middleware for å sjekke innlogging
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.session.userId) {
    return next();
  } else {
    res.redirect("/login"); // Omdiriger brukeren til login-siden hvis ikke innlogget
  }
}

module.exports.signup = signup;
module.exports.ensureAuthenticated = ensureAuthenticated;
