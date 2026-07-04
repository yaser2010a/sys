const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    PermissionsBitField
} = require("discord.js");
const { Database } = require("st.db");
const applyDB = new Database("/Json-db/Bots/applyDB.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("new-apply")
        .setDescription("انشاء تقديم جديد")
        .addRoleOption((option) => option.setName(`role`).setDescription(`الرتبة التي سوف يتم انشاء التقديم عليها`).setRequired(true))
        .addStringOption((option) => option.setName(`ask1`).setDescription(`السوال الاول`).setRequired(true))
        .addStringOption((option) => option.setName(`ask2`).setDescription(`السوال الثاني`).setRequired(false))
        .addStringOption((option) => option.setName(`ask3`).setDescription(`السوال الثالث`).setRequired(false))
        .addStringOption((option) => option.setName(`ask4`).setDescription(`السوال الرابع`).setRequired(false))
        .addStringOption((option) => option.setName(`ask5`).setDescription(`السوال الخامس`).setRequired(false))
        .addStringOption((option) => option.setName(`ask6`).setDescription(`السوال السادس`).setRequired(false))
        .addStringOption((option) => option.setName(`ask7`).setDescription(`السوال السابع`).setRequired(false))
        .addAttachmentOption((option) => option.setName(`image`).setDescription(`الصورة في ايمبد التقديم`).setRequired(false))
        .addStringOption((option) => option.setName(`button`).setDescription(`لون الزر`).addChoices(
            { name: `رمادي`, value: '2' },
            { name: `ازرق`, value: '1' },
            { name: `اخضر`, value: '3' },
            { name: `احمر`, value: '4' },
        ).setRequired(false)),

    async execute(interaction) {
        // --- حماية الأمر للأونر فقط ---
        const ownerID = "1363178020621254776"; // ضع ID الخاص بك هنا
        if (interaction.user.id !== ownerID && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ هذا الأمر مخصص للإدارة فقط!", ephemeral: true });
        }

        const settings = await applyDB.get(`apply_settings_${interaction.guild.id}`);

        if (!settings) {
            return interaction.reply({
                content: `**يرجى تسطيب نظام التقديمات اولا \n /setup-apply**`,
                ephemeral: true,
            });
        }

        // حفظ البيانات
        let role = interaction.options.getRole(`role`);
        await applyDB.set(`apply_${interaction.guild.id}`, {
            roleid: role.id,
            ask1: interaction.options.getString(`ask1`),
            ask2: interaction.options.getString(`ask2`),
            ask3: interaction.options.getString(`ask3`),
            ask4: interaction.options.getString(`ask4`),
            ask5: interaction.options.getString(`ask5`),
            ask6: interaction.options.getString(`ask6`),
            ask7: interaction.options.getString(`ask7`),
        });

        // إنشاء المودال
        const modal = new ModalBuilder().setCustomId('message_modal').setTitle('رسالة التقديم');
        const messageInput = new TextInputBuilder()
            .setCustomId('message_input')
            .setLabel('رسالة التقديم في الامبد')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
        await interaction.showModal(modal);

        // انتظار استجابة المودال
        try {
            const modalSubmit = await interaction.awaitModalSubmit({ time: 60000 });
            const message = modalSubmit.fields.getTextInputValue('message_input');
            const theapplyroom = interaction.guild.channels.cache.get(settings.applyroom);
            const buttonColor = interaction.options.getString(`button`) || "1";
            const image = interaction.options.getAttachment(`image`);

            const applybutton = new ButtonBuilder()
                .setCustomId(`apply_button`)
                .setLabel(`التقديم`)
                .setStyle(parseInt(buttonColor))
                .setEmoji("✍🏻");

            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                .setThumbnail(interaction.guild.iconURL())
                .setDescription(`**${message}**`)
                .setColor("Blue");

            if (image) embed.setImage(image.url);

            await theapplyroom.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(applybutton)] });
            await modalSubmit.reply({ content: '✅ تم إرسال رسالة التقديم بنجاح!', ephemeral: true });
        } catch (err) {
            console.error(err);
        }
    }
};