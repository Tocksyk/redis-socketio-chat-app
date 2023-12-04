const config = require("../config");
var util = require("../middleware/utilities");
var user = require("../passport/user");

exports.login = function login(req, res) {
  res.render("login", { title: "Login", message: req.flash("error") });
};
exports.chat = function chat(req, res) {
  res.render("chat", { title: "Chat" });
};
// function loginProcess(req, res) {
//   console.log(req.body);
//   var isAuth = util.auth(req.body.username, req.body.password, req.session);
//   if (isAuth) {
//     res.redirect("/chat");
//   } else {
//     req.flash("error", "Wrong Username or Password");
//     res.redirect(config.routes.login);
//   }
// }
exports.index = function index(req, res) {
  res.cookie("IndexCookie", "This was set from Index");
  res.render("index", {
    title: "Index",
    cookie: JSON.stringify(req.cookies),
    session: JSON.stringify(req.session),
    signedCookie: JSON.stringify(req.signedCookies),
  });
};
function logOut(req, res) {
  util.logOut(req, res);
  // res.redirect("/");
}
function register(req, res) {
  res.render("register", { title: "Register", message: req.flash("error") });
}
function registerProcess(req, res) {
  if (req.body.username && req.body.password) {
    user.addUser(req.body.username, req.body.password, config.crypto.workFactor, function (err, profile) {
      if (err) {
        req.flash("error", err);
        res.redirect(config.routes.register);
      } else {
        req.login(profile, function (err) {
          res.redirect("/chat");
        });
      }
    });
  } else {
    req.flash("error", "Please fill out all the fields");
    res.redirect(config.routes.register);
  }
}
// module.exports.index = index;
// module.exports.login = login;
// module.exports.loginProcess = loginProcess;
// module.exports.chat = chat;
module.exports.logOut = logOut;
module.exports.register = register;
module.exports.registerProcess = registerProcess;
