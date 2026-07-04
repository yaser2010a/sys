const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionsBitField 
} = require("discord.js");

const { Database } = require("st.db");
const applyDB = new Database("/Json-db/Bots/applyDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-apply')
        .setDescription('تسطيب نظام التقديم')
        .addChannelOption(option => option.setName(`applyroom`).setDescription(`روم التقديم`).setRequired(true))
        .addChannelOption(option => option.setName(`appliesroom`).setDescription(`روم وصول التقديمات`).setRequired(true))
        .addChannelOption(option => option.setName(`resultsroom`).setDescription(`روم النتائج`).setRequired(true))
        .addRoleOption(option => option.setName(`adminrole`).setDescription(`رتبة الادارة`).setRequired(true)),

    async execute(interaction) {
        // --- حماية الأمر للأونر فقط ---
        const ownerID = "1363178020621254776"; 
        if (interaction.user.id !== ownerID) {
            return interaction.reply({ 
                content: "❌ هذا الأمر مخصص لصاحب البوت فقط!", 
                ephemeral: true 
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const applyroom = interaction.options.getChannel(`applyroom`);
        const appliesroom = interaction.options.getChannel(`appliesroom`);
        const resultsroom = interaction.options.getChannel(`resultsroom`);
        const adminrole = interaction.options.getRole(`adminrole`);

        // حفظ الإعدادات في قاعدة البيانات
        await applyDB.set(`apply_settings_${interaction.guild.id}`, {
            applyroom: applyroom.id,
            appliesroom: appliesroom.id,
            resultsroom: resultsroom.id,
            adminrole: adminrole.id,
        });

        const embed = new EmbedBuilder()
            .setTitle(`✅ تم تحديد نظام التقديمات بنجاح`)
            .addFields(
                { name: "روم التقديم", value: `${applyroom}`, inline: true },
                { name: "روم الوصول", value: `${appliesroom}`, inline: true },
                { name: "روم النتائج", value: `${resultsroom}`, inline: true },
                { name: "رتبة الإدارة", value: `${adminrole}`, inline: true }
            )
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

        return interaction.editReply({ embeds: [embed] });
    }
};