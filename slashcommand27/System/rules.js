const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

module.exports = {

  permissions: {
    mode: "owner" // ← فقط الأونر يستخدم الأمر
  },

  data: new SlashCommandBuilder()
    .setName("rulespanel")
    .setDescription("إرسال بانيل القوانين"),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setTitle("📜 قائمة القوانين")
      .setDescription("اختر نوع القوانين من القائمة بالأسفل")
      .setImage("https://cdn.discordapp.com/attachments/1498718919253430333/1514707529769160965/rules.png?ex=6a2c58d1&is=6a2b0751&hm=905d6fb3fb88bd09250762234912f7125d1f360856a27b6d3e381b4233e54e5b&")
      .setColor("#2b2d31");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("rules_panel")
      .setPlaceholder("اختر نوع القوانين")
      .addOptions([
        {
          label: "قوانين السيرفر",
          value: "server_rules"
        },
        {
          label: "قوانين الإدارة",
          value: "admin_rules"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};
