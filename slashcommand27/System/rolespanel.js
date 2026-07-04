const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolespanel')
        .setDescription('فتح قائمة الرتب'),

    async execute(interaction) {

        if (interaction.user.id !== config.owner) {
            return interaction.reply({
                content: "❌ هذا الأمر مخصص لصاحب السيرفر فقط.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#fcfdff')
            .setImage('https://cdn.discordapp.com/attachments/1498718919253430333/1514707782392090684/roles.png?ex=6a2daa8d&is=6a2c590d&hm=256ea2ce6337264e29cc71845b6b3a928fd68bb5fc1b17f4a781c81ee0f152d8&') // ضع رابط الصورة الصحيح هنا
            .setDescription('اختر القسم الذي تريده من القائمة بالأسفل');

        const menu = new StringSelectMenuBuilder()
            .setCustomId('roles_menu')
            .setPlaceholder('اختر قسم الرتب')
            .addOptions([
                {
                    label: 'الرتب التفاعلية',
                    value: 'react_roles'
                },
                {
                    label: 'الرتب الخاصة',
                    value: 'special_roles'
                },
                {
                    label: 'الرتب الشرائية',
                    value: 'buy_roles'
                }
            ]);

        await interaction.reply({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(menu)]
        });
    }
};
