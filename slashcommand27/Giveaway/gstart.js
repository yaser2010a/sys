const { SlashCommandBuilder, EmbedBuilder ,ButtonStyle, PermissionsBitField, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { Database } = require("st.db")
const giveawayDB = new Database("/Json-db/Bots/giveawayDB.json")
const moment = require('moment');
const ms = require('ms')

module.exports = {

    permissions: {
        mode: "role+room",
        roleId: "1500486850471657713",
        roomId: "1464926669017186499"
    },

    data: new SlashCommandBuilder()
    .setName('gstart')
    .setDescription('بدأ جيف اواي')
    .addStringOption(Option => 
        Option
        .setName('duration')
        .setDescription('المدة')
        .setRequired(true))
    .addIntegerOption(Option => Option
        .setName(`winners`)
        .setDescription(`عدد الفائزين`)
        .setRequired(true))
    .addStringOption(Option => Option
        .setName(`prize`)
        .setDescription(`الفائزين`)
        .setRequired(true)),

async execute(interaction) {
    const duration = interaction.options.getString(`duration`)
    const winners = interaction.options.getInteger(`winners`)
    const prize = interaction.options.getString(`prize`)
    const hasTimeUnit = /[mdhs]/i.test(duration);
    await interaction.deferReply({ephemeral:true})

    if(!hasTimeUnit) return interaction.editReply({content:`**الرجاء تحديد الوقت بطريقة صحيحة**` , ephemeral:true})

    const embed = new EmbedBuilder()
    .setTitle(`**${prize}**`)
    .setDescription(`Ends : <t:${Math.floor((Date.now() + ms(duration)) / 1000)}:R> (<t:${Math.floor((Date.now() + ms(duration)) / 1000)}:f>)\nHosted by : ${interaction.user}\nEntries : **0**\nWinners: **${winners}**`)
    .setColor(`#5865f2`)
    .setTimestamp(Date.now() + ms(duration))

    const dir1 = Math.floor((Date.now() + ms(duration)) / 1000)
    const dir2 = Date.now() + ms(duration)

    const button = new ButtonBuilder()
    .setEmoji(`🎉`)
    .setStyle(ButtonStyle.Primary)
    .setCustomId(`join_giveaway`)
    .setDisabled(false)

    const row = new ActionRowBuilder().addComponents(button)

    let giveaways = giveawayDB.get(`giveaways_${interaction.guild.id}`)
    if(!giveaways) {
        await giveawayDB.set(`giveaways_${interaction.guild.id}` , [])
    } 
    giveaways = giveawayDB.get(`giveaways_${interaction.guild.id}`)

    const send2 = await interaction.channel.send({embeds:[embed] , components:[row]})

    giveaways.push({
        messageid:send2.id,
        channelid:interaction.channel.id,
        entries:[],
        winners:winners,
        prize:prize,
        duration:ms(duration) / 1000,
        dir1:dir1,
        dir2:dir2,
        host:interaction.user.id,
        ended:false
    })

    await giveawayDB.set(`giveaways_${interaction.guild.id}` , giveaways)

    return interaction.editReply({content:`**تم انشاء الجيف اواي بنجاح**` , ephemeral:true})
}
}
