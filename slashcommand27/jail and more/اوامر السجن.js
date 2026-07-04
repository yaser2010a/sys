const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");
const config = require("./config.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("اوامر-السجن") // ملاحظة: لا يمكن استخدام مسافات في أسماء السلاش
    .setDescription("عرض قائمة اوامر السجن"),

  async execute(interaction) {
    // إنشاء الـ Embed
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('📜 قائمة الأوامر — نظام السجن')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .addFields(
        {
          name: '⛓️ أوامر السجن',
          value: [
            `/سجن [العضو] [الدقائق] [السبب]`,
            `/عفو [العضو] [السبب]`,
            `/مسجونين`,
          ].join('\n'),
        },
        {
          name: '⚙️ أوامر المالك',
          value: [
            `/سجان [الرتبة]`,
            `/رتبه-السجن [الرتبة]`,
            `/اخفاء-جميع-الرومات`,
            `/ايقاف-النظام`,
          ].join('\n'),
        },
        {
          name: '🔧 عام',
          value: [
            `/اوامر-السجن`,
            `/بينج`,
            `/معلومات`,
          ].join('\n'),
        },
      );

    // ملاحظة: تأكد من تعريف متغير menu قبل هذا السطر إذا كنت تستخدم قائمة منسدلة
    // const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      // components: [row] // قم بإلغاء التعليق عند إضافة القائمة المنسدلة
    });
  },
};