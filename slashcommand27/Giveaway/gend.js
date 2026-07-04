const { SlashCommandBuilder, EmbedBuilder ,ButtonStyle, PermissionsBitField, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { Database } = require("st.db")
const giveawayDB = new Database("/Json-db/Bots/giveawayDB.json")
const moment = require('moment');
const ms = require('ms')

module.exports = {

    permissions: {
        mode: "role+room",
        roleId: "1500486850471657713",   // ← ضع ID الرتبة
        roomId: "1464926669017186499"    // ← ضع ID الروم
    },

    data: new SlashCommandBuilder()
    .setName('gend')
    .setDescription('انهاء جيف اواي')
    .addStringOption(Option => 
        Option
        .setName('giveawayid')
        .setDescription('ايدي رسالة الجيف اواي')
        .setRequired(true)),

async execute(interaction) {
    await interaction.deferReply({ephemeral:true})
    const giveawayid = interaction.options.getString(`giveawayid`)
    let giveaways = giveawayDB.get(`giveaways_${interaction.guild.id}`)
    if(!giveaways) {
        await giveawayDB.set(`giveaways_${interaction.guild.id}` , [])
    } 
    giveaways = giveawayDB.get(`giveaways_${interaction.guild.id}`)
    await interaction.channel.messages.fetch(giveawayid)
    const giveawayFind = giveaways.find(gu => gu.messageid == giveawayid)
    if(!giveawayFind) return interaction.editReply({content:`**لم يتم العثور على جيف اواي بهذا الايدي**`, ephemeral:true})
    if(giveawayFind.ended == true) return interaction.editReply({content:`**هذا الجيف اواي انتهى بالفعل**` , ephemeral:true})

    giveawayFind.duration = 0;
    giveawayFind.ended = true;
    giveawayDB.set(`giveaways_${interaction.guild.id}` , giveaways)

    return interaction.editReply({content:`**تم انهاء هذا الجيف اواي بنجاح**`})
}
}
