const { EmbedBuilder } = require('discord.js');
const config = require('./config.js');
const { isAdmin } = require('./utils');

module.exports = {
  name: 'ايقاف-النظام',
  description: 'تشغيل/إيقاف نظام السجن',
  usage: '!ايقاف-النظام',
  async execute(message) {
    if (!isAdmin(message.author)) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.errorColor).setTitle('🚫 ممنوع').setDescription('هذا الأمر للمالك فقط.').setTimestamp()] });
    }
    config.systemEnabled = !config.systemEnabled;
    message.channel.send({ embeds: [new EmbedBuilder().setColor(config.systemEnabled ? config.successColor : config.errorColor).setTitle(config.systemEnabled ? '✅ تم تشغيل النظام' : '🔴 تم إيقاف النظام').setDescription(config.systemEnabled ? 'نظام السجن الآن مفعّل.' : 'نظام السجن موقوف — لا أحد يقدر يسجن.').setFooter({ text: `تم بواسطة: ${message.author.tag}` }).setTimestamp()] });
  },
};
