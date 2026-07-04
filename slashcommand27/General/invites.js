const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invites")
        .setDescription("Shows your invites"),

    async execute(interaction) {

        const invitesPath = path.join(__dirname, "../../Json-db/invites.json");
        delete require.cache[require.resolve(invitesPath)];
        const invitesData = require(invitesPath);

        const user = interaction.user;
        const data = invitesData[user.id] || { real: 0, fake: 0, total: 0 };

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Invites`)
            .setColor(0x2b2d31)
            .setDescription(`
**Total:** ${data.total}
**Real:** ${data.real}
**Fake:** ${data.fake} 💩
            `);

        await interaction.reply({ embeds: [embed] });
    }
};

