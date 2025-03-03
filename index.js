require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");

// تشغيل سيرفر صغير لمنع تعطّل البوت (خاص بالهوستينج مثل Replit)
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.sendStatus(200));
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// إنشاء عميل ديسكورد مع التفعيل الكامل للأوامر
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

// إعدادات عامة
const prefix = "-";
const dev = process.env.DEV_ID || "966461149782626324";
const dv = process.env.DEV_NAME || "_2ca";

// عند تشغيل البوت
client.once("ready", () => {
  client.user.setActivity("🔹 أفضل بوت برودكاست 🔹");
  console.log(`
    ✅ Bot Online
    🤖 Name: ${client.user.tag}
    🆔 ID: ${client.user.id}
    👨‍💻 Developer: ${dv} (${dev})
    🔹 Prefix: ${prefix}
  `);
});

// أوامر البوت
client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  // أمر المساعدة
  if (message.content.startsWith(prefix + "help")) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("🚫 لا تملك الصلاحيات المطلوبة");
    }

    const embed = new EmbedBuilder()
      .setTitle("📜 قائمة الأوامر")
      .setColor("#0099ff")
      .addFields(
        { name: `${prefix}help`, value: "عرض القائمة الحالية" },
        { name: `${prefix}bc [رسالة]`, value: "📢 بث عام لجميع الأعضاء" },
        { name: `${prefix}ebc [رسالة]`, value: "📢 بث مع Embed" },
        { name: `${prefix}online-bc [رسالة]`, value: "📢 بث للأعضاء النشطين فقط" },
        { name: `${prefix}ping`, value: "⚡ فحص سرعة البوت" }
      );

    return message.channel.send({ embeds: [embed] });
  }

  // أمر البث العادي
  if (message.content.startsWith(prefix + "bc")) {
    handleBroadcast(message, "all");
  }

  // أمر البث المدمج
  if (message.content.startsWith(prefix + "ebc")) {
    handleEmbedBroadcast(message);
  }

  // أمر البث للنشطين
  if (message.content.startsWith(prefix + "online-bc")) {
    handleBroadcast(message, "online");
  }

  // أمر البنغ
  if (message.content.startsWith(prefix + "ping")) {
    const latency = Date.now() - message.createdTimestamp;
    message.channel.send(`🏓 البنغ: ${latency}ms`);
  }
});

// 📢 دالة البث العادي
async function handleBroadcast(message, type) {
  if (!message.member.permissions.has("Administrator")) {
    return message.reply("🚫 لا تملك الصلاحيات المطلوبة");
  }

  const args = message.content.split(" ").slice(1).join(" ");
  if (!args) return message.reply("✉️ يرجى كتابة الرسالة المراد بثها");

  const confirmMsg = await message.channel.send(`هل تريد تأكيد البث؟\n\`${args}\``);
  await confirmMsg.react("✅");
  await confirmMsg.react("❌");

  const filter = (reaction, user) => ["✅", "❌"].includes(reaction.emoji.name) && user.id === message.author.id;
  const collector = confirmMsg.createReactionCollector({ filter, time: 60000 });

  collector.on("collect", async (reaction) => {
    if (reaction.emoji.name === "✅") {
      let members;
      if (type === "online") {
        members = message.guild.members.cache.filter((m) => m.presence?.status !== "offline");
      } else {
        members = message.guild.members.cache;
      }

      members.forEach((member) => {
        if (!member.user.bot) {
          member.send(args).catch(console.error);
        }
      });

      message.channel.send(`✅ تم البث بنجاح إلى ${members.size} عضو`);
    } else {
      message.channel.send("❌ تم إلغاء البث");
    }
    confirmMsg.delete();
    collector.stop();
  });
}

// 📢 دالة البث المدمج
async function handleEmbedBroadcast(message) {
  if (!message.member.permissions.has("Administrator")) {
    return message.reply("🚫 لا تملك الصلاحيات المطلوبة");
  }

  const args = message.content.split(" ").slice(1).join(" ");
  if (!args) return message.reply("✉️ يرجى كتابة الرسالة المراد بثها");

  const confirmMsg = await message.channel.send(`هل تريد تأكيد البث المدمج؟\n\`${args}\``);
  await confirmMsg.react("✅");
  await confirmMsg.react("❌");

  const filter = (reaction, user) => ["✅", "❌"].includes(reaction.emoji.name) && user.id === message.author.id;
  const collector = confirmMsg.createReactionCollector({ filter, time: 60000 });

  collector.on("collect", async (reaction) => {
    if (reaction.emoji.name === "✅") {
      const embed = new EmbedBuilder()
        .setTitle("🔹 إشعار عام 🔹")
        .setDescription(args)
        .setColor("#0099ff")
        .setTimestamp();

      message.guild.members.cache.forEach((member) => {
        if (!member.user.bot) {
          member.send({ embeds: [embed] }).catch(console.error);
        }
      });

      message.channel.send(`✅ تم البث المدمج بنجاح إلى ${message.guild.memberCount} عضو`);
    } else {
      message.channel.send("❌ تم إلغاء البث");
    }
    confirmMsg.delete();
    collector.stop();
  });
}

// 📌 تسجيل الدخول باستخدام التوكن
client.login(process.env.TOKEN);
