const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const applyDB = new Database("/Json-db/Bots/applyDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close-apply')
        .setDescription('إنهاء التقديم المفتوح'),

    async execute(interaction) {
        // --- حماية الأمر للأونر فقط ---
        const ownerID = "1363178020621254776"; // استبدله بالـ ID الخاص بك
        if (interaction.user.id !== ownerID) {
            return interaction.reply({ 
                content: "❌ هذا الأمر مخصص لصاحب البوت فقط!", 
                ephemeral: true 
            });
        }

        await interaction.deferReply({ ephemeral: false });

        // التحقق من وجود تقديم في قاعدة البيانات
        let apply = await applyDB.get(`apply_${interaction.guild.id}`);

        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: interaction.guild.name, 
                iconURL: interaction.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp()
            .setFooter({ 
                text: interaction.user.username, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
            });

        if (!apply) {
            embed.setTitle(`**لا يوجد تقديم مفتوح حالياً**`)
                 .setColor('Red');
            return interaction.editReply({ embeds: [embed] });
        }

        // حذف التقديم من قاعدة البيانات
        await applyDB.delete(`apply_${interaction.guild.id}`);

        embed.setTitle(`**تم إنهاء التقديم بنجاح**`)
             .setColor('Green');
        
        return interaction.editReply({ embeds: [embed] });
    }
};