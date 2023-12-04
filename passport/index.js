var passport = require("passport");
var google = require("passport-google-oauth").OAuth2Strategy,
  config = require("../config"),
  local = require("passport-local").Strategy,
  passwordUtils = require("./password"),
  user = require("./user");
var log = require("../middleware/log");
passport.use(
  new google(
    {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.host + config.routes.googleAuthCallback,
    },
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

passport.use(
  new local(function (username, password, done) {
    user.findByUsername(username, function (err, profile) {
      if (profile) {
        passwordUtils.passwordCheck(password, profile.password, profile.salt, profile.work, function (err, isAuth) {
          if (isAuth) {
            if (profile.work < config.crypto.workFactor) {
              user.updatePassword(username, password, config.crypto.workFactor);
            }
            done(null, profile);
          } else {
            log.debug({ message: "Wrong Username or Password", username: username });
            done(null, false, { message: "Wrong Username or Password" });
          }
        });
      } else {
        log.debug({ message: "Wrong Username or Password", username: username });
        done(null, false, { message: "Wrong Username or Password" });
      }
    });
  })
);

var routes = function routes(app) {
  app.get(
    config.routes.googleAuth,
    passport.authenticate("google", {
      scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
    })
  );
  app.get(
    config.routes.googleAuthCallback,
    passport.authenticate("google", {
      successRedirect: config.routes.chat,
      failureRedirect: config.routes.login,
      failureFlash: true,
    })
  );

  app.post(
    config.routes.login,
    passport.authenticate("local", { successRedirect: "/chat", failureRedirect: config.routes.login, failureFlash: true })
  );
};

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
exports.passport = passport;
exports.routes = routes;
