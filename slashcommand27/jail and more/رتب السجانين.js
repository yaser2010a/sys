const { EmbedBuilder } = require('discord.js');
const config = require('./config.js');
const { isAdmin } = require('./utils');

module.exports = {
  name: 'سجان',
  description: 'تحديد رتبة السجانين',
  usage: '!سجان @الرتبة',
  async execute(message) {
    if (!isAdmin(message.author)) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.errorColor).setTitle('🚫 ممنوع').setDescription('هذا الأمر للمالك فقط.').setTimestamp()] });
    }
    const role = message.mentions.roles.first();
    if (!role) return message.reply({ embeds: [new EmbedBuilder().setColor(config.warnColor).setTitle('⚠️ خطأ').setDescription(`الاستخدام: \`${config.prefix}سجان @الرتبة\``).setTimestamp()] });
    config.jailRoleId = role.id;
    message.channel.send({ embeds: [new EmbedBuilder().setColor(config.successColor).setTitle('✅ تم تحديد رتبة السجانين').setDescription(`فقط أصحاب ${role} يقدرون يستخدمون أوامر السجن.`).addFields({ name: '🆔 ID', value: `\`${role.id}\`` }).setFooter({ text: `تم بواسطة: ${message.author.tag}` }).setTimestamp()] });
  },
};
