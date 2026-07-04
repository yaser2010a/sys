const { ChatInputCommandInteraction, Client, SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {

    permissions: {
        mode: "room",
        roomId: "1464620128909000806"
    },

    ownersOnly: false,

    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('للاستعلام عن رتب السيرفر'),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return interaction.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**`, ephemeral: true });
            }

            // مهم جداً — يمنع Unknown interaction
            await interaction.deferReply();

            let roles = "";
            let names = interaction.guild.roles.cache.map((role) => `${role.name}`);
            let longest = names.reduce(
                (long, str) => Math.max(long, str.length),
                0
            );

            interaction.guild.roles.cache.forEach((role) => {
                roles += `${role.name}${" ".repeat(longest - role.name.length)} : ${role.members.size} members\n`;
            });

            const chunkSizeLimit = 1990;

            let first = true;

            for (let i = 0; i < roles.length; i += chunkSizeLimit) {
                const chunk = roles.substring(i, i + chunkSizeLimit);
                const messageContent = `\`\`\`js\n${chunk}\n\`\`\``;

                if (first) {
                    await interaction.editReply(messageContent);
                    first = false;
                } else {
                    await interaction.followUp(messageContent);
                }
            }

        } catch (error) {
            console.error(error);
            // ما نستخدم reply هنا لأنه يسبب Unknown interaction
        }
    }
}
