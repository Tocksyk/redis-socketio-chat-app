var rabbitPromise = require("./rabbit"),
  config = require("../config");

function queueSetup(rabbit) {
  rabbit.queue("debug.log", { autoDelete: false }, function (q) {
    q.bind(config.rabbitMQ.exchange, "*.log");
    q.close();
  });

  rabbit.queue("error.log", { autoDelete: false }, function (q) {
    q.bind(config.rabbitMQ.exchange, "error.log");
    q.close();
  });
}

module.exports = new Promise(function (resolve, reject, notify) {
  rabbitPromise.then(function (rabbit) {
    rabbit.exchange(config.rabbitMQ.exchange, { type: "topic", autoDelete: false }, function (ex) {
      queueSetup(rabbit);
      resolve(ex);
    });
  });
});
