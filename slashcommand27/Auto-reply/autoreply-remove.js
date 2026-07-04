const {ChatInputCommandInteraction , Client , SlashCommandBuilder, EmbedBuilder , PermissionsBitField, ActionRowBuilder,ButtonBuilder,MessageComponentCollector,ButtonStyle } = require("discord.js");
const { Database } = require("st.db")
const one4allDB = new Database("/Json-db/Bots/one4allDB.json")

module.exports ={

    permissions: {
        mode: "owner" // ← فقط الأونر يستخدم الأمر
    },

    data: new SlashCommandBuilder()
    .setName('autoreply-remove')
    .setDescription('لازالة رد تلقائي')
    .addStringOption(Option => Option
                            .setName(`word`)
                            .setDescription(`الكلمة`)
                            .setRequired(true)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            await interaction.deferReply();
            const word = interaction.options.getString(`word`)

            const replysCheck = await one4allDB.get(`replys_${interaction.guild.id}`);

            if(replysCheck){
                const data = await replysCheck.find((r) => r.word == word)

                if(data){
                    const replysFiltered = replysCheck.filter(r => r.word !== word)
                    await one4allDB.set(`replys_${interaction.guild.id}` , replysFiltered)
                    return interaction.editReply({content : `**تم حذف الرد التلقائي \`${word}\`**`});
                }else{
                    return interaction.editReply({content : `**لا يوجد رد بهذه الكلمة \`${word}\`**`});
                }
            }else{
                return interaction.editReply({content : `**لا يوجد رد بهذه الكلمة \`${word}\`**`});
            }
        } catch {
            return interaction.editReply({content:`**لقد حدث خطا اتصل بالمطورين**`})
        }
    }
}
