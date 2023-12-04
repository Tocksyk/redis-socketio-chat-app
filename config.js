var config = {
  port: 3000,
  secret: "secret",
  redisPort: 6379,
  redisHost: "localhost",
  routes: {
    register: "/account/register",
    chat: "/chat",
    login: "/account/login",
    logout: "/account/logout",
    googleAuth: "/auth/google",
    googleAuthCallback: "/auth/google/callback",
  },
  host: "http://localhost:3000",
  google: {
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
  },
  crypto: {
    workFactor: 5000,
    keylen: 32,
    randomSize: 256,
  },
  rabbitMQ: {
    URL: "amqp://guest:guest@localhost:5672",
    exchange: "packtchat.log",
  },
};
module.exports = config;
