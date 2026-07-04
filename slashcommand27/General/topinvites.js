const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("topinvites")
        .setDescription("Shows top inviters"),

    async execute(interaction) {

        const invitesPath = path.join(__dirname, "../../Json-db/invites.json");

        // قراءة بدون كاش
        delete require.cache[require.resolve(invitesPath)];
        const invitesData = require(invitesPath);

        const sorted = Object.entries(invitesData)
            .sort((a, b) => b[1].total - a[1].total);

        const page = 0;
        const perPage = 7;

        const slice = sorted.slice(page * perPage, (page + 1) * perPage);

        // لو ما فيه ولا واحد
        let descriptionText = "";

        if (slice.length === 0) {
            descriptionText = "🚫 لا يوجد أي شخص لديه انفايتات حتى الآن.";
        } else {
            descriptionText = slice
                .map(([id, data], i) =>
                    `**#${i + 1}** <@${id}> — **${data.total} invites**`
                )
                .join("\n");
        }

        const embed = new EmbedBuilder()
            .setTitle("Top Invites")
            .setColor(0x2b2d31)
            .setDescription(descriptionText);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`top_next_${page + 1}`)
                .setLabel("Next")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(sorted.length <= perPage) // تعطيل الزر لو ما فيه صفحات
        );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
