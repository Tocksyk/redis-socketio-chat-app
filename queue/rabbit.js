var amqp = require("amqp"),
  config = require("../config");

module.exports = new Promise((resolve, reject) => {
  var rabbit = amqp.createConnection(config.rabbitMQ.URL);
  rabbit.on("ready", function () {
    resolve(rabbit);
  });
});
