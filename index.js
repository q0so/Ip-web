require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

// سيرفر صغير لمنع تعطّل البوت في Vercel
app.get("/", (req, res) => res.send("✅ البوت يعمل بنجاح!"));
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// إعداد البوت
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// تسجيل الدخول
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// استجابة البوت عند تلقي كلمة "مواقع"
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().includes("مواقع")) {
    message.reply("📌 هذه المواقع : **google.com**");
  }
});

// تشغيل البوت
client.login(process.env.TOKEN);
