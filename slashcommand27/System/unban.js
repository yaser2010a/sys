const { ChatInputCommandInteraction, Client, PermissionsBitField, SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db")
const systemDB = new Database("/Json-db/Bots/systemDB.json")

module.exports = {

    permissions: {
        mode: "role",
        roleId: "1464624903918457035"
    },

    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('اعطاء بان لشخص او ازالته')
        .addUserOption(Option => Option
            .setName(`member`)
            .setDescription(`الشخص`)
            .setRequired(true))
        .addStringOption(Option => Option
            .setName(`reason`)
            .setDescription(`السبب`)
            .setRequired(false)),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                return interaction.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**`, ephemeral: true });
            }

            const user = interaction.options.getUser(`member`);
            const member = interaction.options.getMember(`member`);
            const reasonInput = interaction.options.getString(`reason`);
            const reason = reasonInput ? `${reasonInput} , By : ${interaction.user.id}` : `By : ${interaction.user.id}`;

            const banList = await interaction.guild.bans.fetch();
            const bannedUser = banList.get(user.id);

            if (!bannedUser) {
                // البان
                if (!member) return interaction.reply({ content: `**لم اجد هذا العضو**`, ephemeral: true });
                await member.ban({ reason: reason }).catch(async () => {
                    return interaction.reply({ content: `**الرجاء التحقق من صلاحياتي ثم اعادة المحاولة**`, ephemeral: true });
                });
                return interaction.reply({ content: `**تم اعطاء البان للشخص بنجاح**` });

            } else {
                // فك البان
                await interaction.guild.members.unban(user.id).catch(async () => {
                    return interaction.reply({ content: `**الرجاء التحقق من صلاحياتي ثم اعادة المحاولة**`, ephemeral: true });
                });

                // إنشاء رابط دعوة تلقائي
                const invite = await interaction.guild.invites.create(interaction.channel, {
                    maxAge: 0,
                    maxUses: 0,
                    unique: false
                }).catch(() => null);

                const inviteLink = invite ? invite.url : 'تعذر إنشاء الرابط';

                // إرسال DM للشخص بعد فك البان
                try {
                    await user.send({
                        content: `✅ **تم فك حظرك من سيرفر ${interaction.guild.name}**\n\nنرجو منك مراجعة قوانين السيرفر والالتزام بالاحترام لضمان عدم تكرار الحظر.\n\n🔗 رابط السيرفر: ${inviteLink}`
                    });
                } catch {
                    // الشخص أغلق DM، نتجاهل الخطأ
                }

                return interaction.reply({ content: `**تم ازالة البان عن الشخص بنجاح**` });
            }

        } catch (error) {
            interaction.reply({ content: `لقد حدث خطأ اتصل بالمطورين`, ephemeral: true });
            console.log(error);
        }
    }
}