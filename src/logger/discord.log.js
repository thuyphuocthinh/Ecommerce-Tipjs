// 1314221126024560650
"use strict";

const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`Logged is as ${client.user.tag}`);
});

// const token =
  // "MTMxNDIxOTgzNjMyMjA5MTA5MA.GwZ1Xf.lph9VNqLcjeJZneitt82YZObGOh5azvz3z_a-o";
client.login(token);

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  if (msg.content.toLowerCase() === "hello") {
    msg.reply("Hello, How can I help you!");
  }
});
