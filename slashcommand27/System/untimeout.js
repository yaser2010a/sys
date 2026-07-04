const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require("discord.js");

module.exports = {

    permissions: {
        mode: "role",          
        roleId: "1464623559874973729"
    },

    adminsOnly: false,

    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('ازالة التايم اوت من شخص')
        .addUserOption(option =>
            option
                .setName('member')
                .setDescription('الشخص')
                .setRequired(true)
        ),

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({
                content: `❌ **لا تمتلك صلاحية لفعل ذلك**`,
                ephemeral: true
            });
        }

        const member = interaction.options.getMember('member');

        if (!member) {
            return interaction.reply({
                content: `❌ **لم أجد هذا العضو داخل السيرفر**`,
                ephemeral: true
            });
        }

        await member.timeout(null).catch(() => {
            return interaction.reply({
                content: `❌ **الرجاء التحقق من صلاحياتي ثم اعادة المحاولة**`,
                ephemeral: true
            });
        });

        return interaction.reply({
            content: `✅ **تم ازالة التايم اوت من ${member.user.tag}**`
        });
    }
};
