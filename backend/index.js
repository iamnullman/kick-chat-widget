require("advanced-logs");

const KickBot = require("./modules/kick.js");
const express = require("express");
const { createServer } = require("http");

const { WebSocketServer } = require("ws");
const app = express();

const server = createServer(app);
const wss = new WebSocketServer({ server });

const websocketServers = new Map();
const bot = new KickBot.default([19974982], "");

console.setConfig({
  background: false,
  timestamp: true,
});

bot.connect();

bot.on("connected", (chatroomNumber) => {
  console.log(`Connected to chatroom ${chatroomNumber}`);
});

wss.on("connection", function (ws) {
  console.log("started client interval");

  const token = Math.random().toString(36).substr(2, 9);
  websocketServers.set(token, ws);

  const id = setInterval(function () {
    ws.send("ping");
  }, 1000);
  ws.on("error", console.error);

  ws.on("close", function () {
    console.log("stopping client interval");
    clearInterval(id);
    websocketServers.delete(token);
  });
});
bot.on("message", (message) => {
  websocketServers.forEach((ws) => {
    ws.send(
      JSON.stringify({
        type: "message",
        ...message,
      })
    );
  });
});
server.listen(8080, function () {
  console.log("Listening on http://localhost:8080");
});