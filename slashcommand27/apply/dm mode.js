const { 
  SlashCommandBuilder, 
  EmbedBuilder 
} = require("discord.js");
const { Database } = require("st.db");
const applyDB = new Database("/Json-db/Bots/applyDB.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dm-mode")
    .setDescription("تفعيل أو تعطيل إرسال رسالة للخاص عند قبول/رفض التقديم")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("اختر حالة النظام")
        .addChoices(
          { name: "تفعيل", value: "enable" },
          { name: "تعطيل", value: "disable" }
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    // --- حماية الأمر للأونر فقط ---
    const ownerID = "1363178020621254776"; // استبدله بالـ ID الخاص بك
    if (interaction.user.id !== ownerID) {
      return interaction.reply({ 
        content: "❌ هذا الأمر مخصص لصاحب البوت فقط!", 
        ephemeral: true 
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const type = interaction.options.getString("type");
    const status = type === "enable";

    // حفظ الحالة في قاعدة البيانات
    await applyDB.set(`dm_${interaction.guild.id}`, status);

    const embed = new EmbedBuilder()
      .setAuthor({ 
        name: interaction.guild.name, 
        iconURL: interaction.guild.iconURL({ dynamic: true }) 
      })
      .setTitle(status ? "✅ تم تفعيل نظام الخاص" : "❌ تم تعطيل نظام الخاص")
      .setDescription(`أصبح النظام الآن: **${status ? "مفعل" : "معطل"}**`)
      .setColor(status ? "#00FF00" : "#FF0000")
      .setTimestamp()
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

    return interaction.editReply({ embeds: [embed] });
  },
};