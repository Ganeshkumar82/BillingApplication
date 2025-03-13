const mqtt = require("mqtt");

// MQTT connection options
const options = {
  host: "localhost",
  port: 1883,
  protocol: "mqtt",
  username: "myUser",
  password: "myPass",
};

function publishMqttMessage(topic, message) {
  return new Promise((resolve, reject) => {
    const client = mqtt.connect(options);
    client.on("connect", () => {
      client.publish(topic, message, (err) => {
        if (err) {
          reject(err);
        } else {
          client.end();
          resolve();
        }
      });
    });
    client.on("error", (error) => {
      reject(error);
    });
  });
}

// Export the function so it can be used elsewhere
module.exports = { publishMqttMessage };
