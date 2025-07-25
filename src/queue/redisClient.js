require("dotenv").config();

const { createClient } = require("redis");
const redisUrl = process.env.REDIS_URL;
const client = createClient({ url: redisUrl });

client.on("error", (err) => console.error("Redis Client Error", err));
client.on("connect", () => console.log("Redis Client connecting"));
client.on("ready", () => console.log("Redis Client ready"));
client.on("end", () => console.log("Redis Client disconnected"));

(async () => {
  try {
    await client.connect();
    console.log("Connected to Redis successfully");
  } catch (err) {
    console.error("Redis connection error", err);
  }
})();

module.exports = client;
