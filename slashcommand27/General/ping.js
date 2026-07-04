const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField, ActionRowBuilder,ButtonBuilder,MessageComponentCollector,ButtonStyle } = require("discord.js");

module.exports = {

    permissions: {
        mode: "room",       // ← السماح للجميع لكن داخل روم محدد فقط
        roomId: "1464620128909000806"   // ← ضع هنا ID الروم المسموح
    },

    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('لتجربة سرعة البوت'),

    async execute(interaction, client) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });

        let embed1 = new EmbedBuilder()
            .setFooter({text:interaction.user.username , iconURL:interaction.user.displayAvatarURL({dynamic:true})})
            .setAuthor({name:interaction.guild.name , iconURL:interaction.guild.iconURL({dynamic:true})})
            .setTimestamp(Date.now())
            .setColor('#000000')
            .setTitle(`**My Ping : \`${sent.createdTimestamp - interaction.createdTimestamp}\`ms**`);

        return interaction.editReply({content : `` , embeds:[embed1]});
    }
}
