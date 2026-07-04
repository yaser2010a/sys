const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/BroadcastDB");

module.exports = {
    permissions: {
        mode: "owner"
    },
    ownersOnly: false,

    data: new SlashCommandBuilder()
        .setName('tax')
        .setDescription('معرفة ضريبة رقم')
        .addStringOption(option =>
            option.setName('number')
                .setDescription('الرقم المراد معرفة ضريبته')
                .setRequired(true)),
    async execute(interaction) {
        let number = interaction.options.getString('number');

        if (number.endsWith("k")) number = number.replace(/k/gi, "") * 1000;
        else if (number.endsWith("m")) number = number.replace(/m/gi, "") * 1000000;

        let number2 = parseInt(number);
        let tax = Math.floor(number2 * 20 / 19 + 1);

        return interaction.reply(`${tax}`);
    }
};
