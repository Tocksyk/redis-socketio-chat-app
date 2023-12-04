var config = require("./config");
var io = require("./socket.io");
var express = require("express");
var app = express();
var csrf = require("csurf");
var util = require("./middleware/utilities");
var partials = require("express-partials");
var routes = require("./routes");
var errorHandlers = require("./middleware/errorhandlers");
var log = require("./middleware/log");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var RedisStore = require("connect-redis")(session);
var bodyParser = require("body-parser");
var flash = require("connect-flash");
var passport = require("./passport");

app.set("view options", { defaultLayout: "layout" });
app.set("view engine", "ejs");

// MIDDLEWARE STACK
app.use(partials());
app.use(log.logger);
app.use(express.static(__dirname + "/static"));
app.use((req, res, next) => {
  console.log("=========== before cookie parser Middleware ===========");
  console.log("req.signedCookies ", req.signedCookies);
  console.log("req.cookies ", req.cookies);
  console.log("req.session ", req.session);
  // console.log("req.csrfToken() -----> ", req.csrfToken());
  // console.log("req.session -----> ", req.session);
  next();
});
app.use(cookieParser(config.secret));
app.use((req, res, next) => {
  console.log("=========== after cookie parser Middleware ===========");
  console.log("req.signedCookies ", req.signedCookies);
  console.log("req.cookies ", req.cookies);
  console.log("req.session ", req.session);
  console.log("req.session ", req.sessionID);
  next();
});
app.use(
  session({
    secret: config.secret,
    saveUninitialized: true,
    resave: true,
    store: new RedisStore({ host: config.redisHost, port: config.redisPort }),
  })
);
app.use((req, res, next) => {
  console.log("=========== after session Middleware ===========");
  console.log("req.signedCookies ", req.signedCookies);
  console.log("req.cookies ", req.cookies);
  console.log("req.session ", req.session);
  console.log("req.session ", req.sessionID);
  next();
});
app.use(passport.passport.initialize());
app.use((req, res, next) => {
  console.log("=========== after passport initialize Middleware ===========");
  console.log("req.signedCookies ", req.signedCookies);
  console.log("req.cookies ", req.cookies);
  console.log("req.session ", req.session);
  console.log("req.session ", req.sessionID);
  next();
});
app.use(passport.passport.session());
app.use((req, res, next) => {
  console.log("=========== after passport session Middleware ===========");
  console.log("req.signedCookies ", req.signedCookies);
  console.log("req.cookies ", req.cookies);
  console.log("req.session ", req.session);
  console.log("req.session ", req.sessionID);
  next();
});
app.use(flash());
app.use(util.templateRoutes);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(csrf());
app.use((req, res, next) => {
  console.log("=========== after csrf Middleware ===========");
  console.log("req.signedCookies ", req.signedCookies);
  console.log("req.cookies ", req.cookies);
  console.log("req.session ", req.session);
  console.log("req.session ", req.sessionID);
  next();
});
app.use(util.csrf);
app.use(util.authenticated);

// ROUTES STACK
app.get("/", routes.index);
app.get(config.routes.login, routes.login);
// app.post(config.routes.login, routes.loginProcess);
app.get("/chat", [util.requireAuthentication], routes.chat);
app.get(config.routes.logout, routes.logOut);
app.get(config.routes.register, routes.register);
app.post(config.routes.register, routes.registerProcess);
app.get("/error", function (req, res, next) {
  next(new Error("A contrived error"));
});
passport.routes(app);
app.use(errorHandlers.error);
app.use(errorHandlers.notFound);

// APP START
var server = app.listen(config.port);
io.startIo(server);
console.log("App server running on port 3000");
