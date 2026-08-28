const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildSettings } = require('../utils/database');
const { hasCommandAccess } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setiings')
    .setDescription('إعدادات الترحيب والودائع والليفلنق والتقديمات')
    .addSubcommand(sub => sub.setName('ترحيب')
      .setDescription('تحديد قناة ورسالة الترحيب')
      .addChannelOption(o => o.setName('القناة').setDescription('قناة الترحيب').setRequired(true))
      .addStringOption(o => o.setName('الرسالة').setDescription('استخدم {user} و {server} و {membercount}').setRequired(false)))
    .addSubcommand(sub => sub.setName('وداع')
      .setDescription('تحديد قناة ورسالة الوداع')
      .addChannelOption(o => o.setName('القناة').setDescription('قناة الوداع').setRequired(true))
      .addStringOption(o => o.setName('الرسالة').setDescription('استخدم {user} و {server}').setRequired(false)))
    .addSubcommand(sub => sub.setName('لوقز')
      .setDescription('تحديد قنوات اللوقز (كل نوع بقناته الخاصة)')
      .addChannelOption(o => o.setName('رسائل').setDescription('لوق الرسائل المحذوفة/المعدلة').setRequired(false))
      .addChannelOption(o => o.setName('رياكتات').setDescription('لوق الرياكتات المحذوفة').setRequired(false))
      .addChannelOption(o => o.setName('اعضاء').setDescription('لوق دخول/خروج الأعضاء').setRequired(false))
      .addChannelOption(o => o.setName('صوت').setDescription('لوق دخول/خروج الرومات الصوتية').setRequired(false))
      .addChannelOption(o => o.setName('بان').setDescription('لوق أمر البان').setRequired(false))
      .addChannelOption(o => o.setName('كيك').setDescription('لوق أمر الكيك').setRequired(false))
      .addChannelOption(o => o.setName('انبان').setDescription('لوق أمر الانبان').setRequired(false))
      .addChannelOption(o => o.setName('ميوت').setDescription('لوق أمر الميوت').setRequired(false))
      .addChannelOption(o => o.setName('انميوت').setDescription('لوق أمر الانميوت').setRequired(false))
      .addChannelOption(o => o.setName('وارن').setDescription('لوق أمر الوارن').setRequired(false))
      .addChannelOption(o => o.setName('سجن').setDescription('لوق أوامر السجن (سجن/فك/عفو)').setRequired(false)))
    .addSubcommand(sub => sub.setName('ليفل_كتابي')
      .setDescription('قناة ورسالة تهنئة الليفل أب الكتابي')
      .addChannelOption(o => o.setName('القناة').setDescription('القناة').setRequired(true))
      .addStringOption(o => o.setName('الرسالة').setDescription('استخدم {user} و {level}').setRequired(false)))
    .addSubcommand(sub => sub.setName('ليفل_صوتي')
      .setDescription('قناة ورسالة تهنئة الليفل أب الصوتي')
      .addChannelOption(o => o.setName('القناة').setDescription('القناة').setRequired(true))
      .addStringOption(o => o.setName('الرسالة').setDescription('استخدم {user} و {level}').setRequired(false)))
    .addSubcommand(sub => sub.setName('تقديم')
      .setDescription('قناة استلام تقديمات الإدارة ورتبة المقبولين')
      .addChannelOption(o => o.setName('القناة').setDescription('القناة').setRequired(true))
      .addRoleOption(o => o.setName('الرتبة').setDescription('رتبة تنعطى عند القبول').setRequired(false))),

  async execute(interaction) {
    if (!hasCommandAccess(interaction.member, 'اعدادات', m => m.permissions.has(PermissionFlagsBits.Administrator))) {
      return interaction.reply({ content: 'ما عندك صلاحية تستخدم هذا الأمر', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'ترحيب') {
      updateGuildSettings(guildId, {
        welcome_channel: interaction.options.getChannel('القناة').id,
        welcome_message: interaction.options.getString('الرسالة'),
      });
      return interaction.reply('تم تحديث إعدادات الترحيب ✅');
    }

    if (sub === 'وداع') {
      updateGuildSettings(guildId, {
        leave_channel: interaction.options.getChannel('القناة').id,
        leave_message: interaction.options.getString('الرسالة'),
      });
      return interaction.reply('تم تحديث إعدادات الوداع ✅');
    }

    if (sub === 'لوقز') {
      const fields = {};
      const map = {
        'رسائل': 'log_message',
        'رياكتات': 'log_reaction',
        'اعضاء': 'log_member',
        'صوت': 'log_voice',
        'بان': 'log_ban',
        'كيك': 'log_kick',
        'انبان': 'log_unban',
        'ميوت': 'log_mute',
        'انميوت': 'log_unmute',
        'وارن': 'log_warn',
        'سجن': 'log_jail',
      };
      for (const [opt, col] of Object.entries(map)) {
        const channel = interaction.options.getChannel(opt);
        if (channel) fields[col] = channel.id;
      }
      if (Object.keys(fields).length === 0) {
        return interaction.reply({ content: 'حدد على الأقل قناة وحدة', ephemeral: true });
      }
      updateGuildSettings(guildId, fields);
      return interaction.reply('تم تحديث قنوات اللوقز ✅');
    }

    if (sub === 'ليفل_كتابي') {
      updateGuildSettings(guildId, {
        level_text_channel: interaction.options.getChannel('القناة').id,
        level_text_message: interaction.options.getString('الرسالة'),
      });
      return interaction.reply('تم تحديث إعدادات الليفل الكتابي ✅');
    }

    if (sub === 'ليفل_صوتي') {
      updateGuildSettings(guildId, {
        level_voice_channel: interaction.options.getChannel('القناة').id,
        level_voice_message: interaction.options.getString('الرسالة'),
      });
      return interaction.reply('تم تحديث إعدادات الليفل الصوتي ✅');
    }

    if (sub === 'تقديم') {
      updateGuildSettings(guildId, {
        apply_channel: interaction.options.getChannel('القناة').id,
        apply_role: interaction.options.getRole('الرتبة')?.id ?? null,
      });
      return interaction.reply('تم تحديث إعدادات التقديم ✅');
    }
  },
};
