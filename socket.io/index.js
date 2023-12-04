const cookieParser = require("cookie-parser");

var io = require("socket.io"),
  connect = require("connect"),
  cookie = require("cookie"),
  expressSession = require("express-session"),
  ConnectRedis = require("connect-redis")(expressSession),
  redis = require("redis"),
  config = require("../config"),
  redisSession = new ConnectRedis({ host: config.redisHost, port: config.redisPort });

var socketAuth = function socketAuth(socket, next) {
  var handshakeData = socket.request;
  var parsedCookie = cookie.parse(handshakeData.headers.cookie || "");
  var sid = cookieParser.signedCookie(parsedCookie["connect.sid"] || "", config.secret);

  console.log("===================== SOCKET AUTH ======================");
  console.log("sid", sid);
  console.log("parsedCookie", parsedCookie);
  if (parsedCookie["connect.sid"] === sid) return next(new Error("Not Authenticated"));

  redisSession.get(sid, function (err, session) {
    console.log("================== Redis Session =========================");
    console.log(session);
    if (session.isAuthenticated) {
      console.log("INSI");
      socket.user = session.user;
      socket.sid = sid;
      return next();
    } else return next(new Error("Not Authenticated"));
  });
};

var socketConnection = function socketConnection(socket) {
  socket.emit("message", { message: "Hey!" });
  socket.emit("message", socket.user);
};

exports.startIo = function startIo(server) {
  io = new io.Server(server);
  var packtchat = io.of("/packtchat");

  packtchat.use(socketAuth);
  packtchat.on("connection", socketConnection);

  return io;
};
