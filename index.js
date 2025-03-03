// index.js
const express = require('express');
const Discord = require('discord.js');
const app = express();
const client = new Discord.Client();

// إعدادات السيرفر
const PORT = process.env.PORT || 3000;
app.use(express.json());

// إندبوينتات الصحة
app.get('/', (req, res) => res.sendStatus(200));
app.get('/ping', (req, res) => res.send(new Date().toString()));

// تشغيل السيرفر
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// إعدادات البوت
const prefix = "-";
const dev = process.env.DEV_ID || "YOUR_ID";
const dv = process.env.DEV_NAME || "YOUR_NAME";

// حدث التشغيل
client.on('ready', () => {
  client.user.setActivity(`افضل بوت برودكاست`);
  console.log(`
    Bot Name: ${client.user.tag}
    Bot ID: ${client.user.id}
    Developer: ${dv} (${dev})
    Prefix: ${prefix}
  `);
});

// نظام الأوامر
client.on('messageCreate', async message => {
  if (!message.guild || message.author.bot) return;

  // أمر المساعدة
  if (message.content.startsWith(prefix + "help")) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('🚫 لا تملك الصلاحيات المطلوبة');
    }

    const embed = new Discord.MessageEmbed()
      .setTitle('قائمة الأوامر')
      .setColor('#0099ff')
      .addField(`${prefix}help`, 'عرض القائمة الحالية')
      .addField(`${prefix}bc [رسالة]`, 'بث عام لجميع الأعضاء')
      .addField(`${prefix}ebc [رسالة]`, 'بث مدمج مع إيمبد')
      .addField(`${prefix}online-bc [رسالة]`, 'بث للأعضاء النشطين فقط')
      .addField(`${prefix}ping`, 'فحص سرعة البوت');

    return message.channel.send({ embeds: [embed] });
  }

  // أمر البث العادي
  if (message.content.startsWith(prefix + "bc")) {
    handleBroadcast(message, 'all');
  }

  // أمر البث المدمج
  if (message.content.startsWith(prefix + "ebc")) {
    handleEmbedBroadcast(message);
  }

  // أمر البث للنشطين
  if (message.content.startsWith(prefix + "online-bc")) {
    handleBroadcast(message, 'online');
  }

  // أمر البنغ
  if (message.content.startsWith(prefix + "ping")) {
    const latency = Date.now() - message.createdTimestamp;
    message.channel.send(`🏓 البنغ: ${latency}ms`);
  }
});

// دوال مساعدة
async function handleBroadcast(message, type) {
  if (!message.member.permissions.has('ADMINISTRATOR')) {
    return message.reply('🚫 لا تملك الصلاحيات المطلوبة');
  }

  const args = message.content.split(' ').slice(1).join(' ');
  if (!args) return message.reply('يرجى كتابة الرسالة المراد بثها');

  const confirmMsg = await message.channel.send(`هل تريد تأكيد البث؟\n\`${args}\``);
  await confirmMsg.react('✅');
  await confirmMsg.react('❌');

  const filter = (reaction, user) => 
    ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
  
  const collector = confirmMsg.createReactionCollector({ filter, time: 60000 });

  collector.on('collect', async (reaction) => {
    if (reaction.emoji.name === '✅') {
      let members;
      if (type === 'online') {
        members = message.guild.members.cache.filter(m => m.presence?.status !== 'offline');
      } else {
        members = message.guild.members.cache;
      }

      members.forEach(member => {
        if (member.user.bot) return;
        member.send(args).catch(console.error);
      });

      message.channel.send(`✅ تم البث بنجاح إلى ${members.size} عضو`);
    } else {
      message.channel.send('❌ تم إلغاء البث');
    }
    confirmMsg.delete();
    collector.stop();
  });
}

async function handleEmbedBroadcast(message) {
  if (!message.member.permissions.has('ADMINISTRATOR')) {
    return message.reply('🚫 لا تملك الصلاحيات المطلوبة');
  }

  const args = message.content.split(' ').slice(1).join(' ');
  if (!args) return message.reply('يرجى كتابة الرسالة المراد بثها');

  const confirmMsg = await message.channel.send(`هل تريد تأكيد البث المدمج؟\n\`${args}\``);
  await confirmMsg.react('✅');
  await confirmMsg.react('❌');

  const filter = (reaction, user) => 
    ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
  
  const collector = confirmMsg.createReactionCollector({ filter, time: 60000 });

  collector.on('collect', async (reaction) => {
    if (reaction.emoji.name === '✅') {
      const embed = new Discord.MessageEmbed()
        .setTitle('إشعار عام')
        .setDescription(args)
        .setColor('#0099ff')
        .setTimestamp();

      message.guild.members.cache.forEach(member => {
        if (member.user.bot) return;
        member.send({ embeds: [embed] }).catch(console.error);
      });

      message.channel.send(`✅ تم البث المدمج بنجاح إلى ${message.guild.memberCount} عضو`);
    } else {
      message.channel.send('❌ تم إلغاء البث');
    }
    confirmMsg.delete();
    collector.stop();
  });
}

// تسجيل الدخول
client.login(process.env.TOKEN);
