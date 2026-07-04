const {ChatInputCommandInteraction , Client , SlashCommandBuilder, EmbedBuilder , PermissionsBitField, ActionRowBuilder,ButtonBuilder,MessageComponentCollector,ButtonStyle } = require("discord.js");

module.exports ={

    permissions: {
        mode: "role",          // ← Owner + Role
        roleId: "1464624401793155132" // ← ضع ID الرتبة هنا
    },

    ownersOnly:false,

    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription('اعطاء اسم مستعار لشخص او ازالته')
        .addUserOption(Option => Option
            .setName(`user`)
            .setDescription(`الشخص`)
            .setRequired(true))
        .addStringOption(Option => Option
            .setName(`nickname`)
            .setDescription(`الاسم المستعار`)
            .setRequired(false)),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            const sent = await interaction.deferReply({ fetchReply: true , ephemeral:false });

            const user = interaction.options.getUser(`user`);
            const member = interaction.options.getMember(`user`);
            const nickname = interaction.options.getString(`nickname`);

            if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) 
                return interaction.editReply({content:`**لا تمتلك صلاحية لفعل ذلك**`});
        
            if(!member) 
                return interaction.editReply({content : `**لم اعثر على العضو**`});
        
            if(nickname){
                await member.setNickname(nickname).then(() => {
                    return interaction.editReply({content:`**تم تعيين الاسم المستعار ل __${user.username}__**`});
                }).catch((error) => {
                    console.log(`🔴 | error in nickname command` , error);
                    return interaction.editReply({content: `**لا تمتلك صلاحية لفعل ذلك**` });
                });
            } else {
                await member.setNickname(` `).then(() => {
                    return interaction.editReply({content:`**تم اعادة الاسم المستعار ل __${user.username}__**`});
                }).catch((error) => {
                    console.log(`🔴 | error in nickname command` , error);
                    return interaction.editReply({content: `**لا تمتلك صلاحية لفعل ذلك**` });
                });
            }
        } catch (error){
            console.log(`🔴 | error in nickname command` , error);
            return interaction.editReply({content:`**لقد حدث خطا اتصل بالمطورين**`});
        }
    }
}
