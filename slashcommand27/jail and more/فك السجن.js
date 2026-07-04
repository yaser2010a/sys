const { EmbedBuilder } = require('discord.js');
const config = require('./config.js');
const db = require('./db');
const logger = require('./logger');

module.exports = {
  name: 'عفو',
  description: 'فك سجن عضو وإرجاع رتبه',
  usage: '!عفو @العضو [السبب]',
  async execute(message, args, client27) {
    if (!config.systemEnabled) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.errorColor).setTitle('🔴 النظام موقوف').setDescription('نظام السجن موقوف حالياً.').setTimestamp()] });
    }

    if (!config.jailRoleId || !message.member.roles.cache.has(config.jailRoleId)) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.errorColor).setTitle('⚠️ تحذير').setDescription('لو عدتها بيتم سجنك تلقائي والتفاهم معك في السجن').setTimestamp()] });
    }

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.warnColor).setTitle('⚠️ خطأ').setDescription(`الاستخدام: \`${config.prefix}فك @العضو [سبب]\``).setTimestamp()] });
    }

    // جلب رتبة السجين
    let jailMuteRole = config.jailMuteRoleId
      ? message.guild.roles.cache.get(config.jailMuteRoleId)
      : message.guild.roles.cache.find(r => r.name === '🔒 سجين');

    // التحقق إذا العضو مسجون — إما عنده رتبة السجين أو عنده رتب محفوظة
    const isJailedByRole = jailMuteRole && target.roles.cache.has(jailMuteRole.id);
    const isJailedInDB = db.isJailed(target.id);

    if (!isJailedByRole && !isJailedInDB) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.warnColor).setTitle('⚠️ تنبيه').setDescription(`${target} ليس مسجوناً.`).setTimestamp()] });
    }

    const reason = args.slice(1).join(' ') || 'لم يُذكر سبب';

    // استرجاع الرتب المحفوظة
    const saved = db.getRoles(target.id);
    const toRestore = saved.filter(id => message.guild.roles.cache.has(id));
    await target.roles.set(toRestore).catch(() => {});
    db.deleteRoles(target.id);

    await message.channel.send({
      embeds: [new EmbedBuilder().setColor(config.successColor).setTitle('🔓 تم الإفراج')
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '👤 المُفرج عنه', value: `${target}\n\`${target.user.tag}\``, inline: true },
          { name: '👮 المشرف', value: `${message.author}`, inline: true },
          { name: '📝 السبب', value: reason },
          { name: '✅ الرتب', value: toRestore.length ? `تمت استعادة ${toRestore.length} رتبة` : 'ما في رتب محفوظة' },
        ).setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() }).setTimestamp()],
    });

    await target.send({ embeds: [new EmbedBuilder().setColor(config.successColor).setTitle(`🔓 تم الإفراج عنك في ${message.guild.name}`).addFields({ name: '📝 السبب', value: reason }, { name: '✅ الرتب', value: 'تمت استعادة رتبك' }).setTimestamp()] }).catch(() => {});
    await logger.logUnjail(client27, { mod: message.member, target, reason, guild: message.guild });
  },
};
