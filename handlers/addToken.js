const {
    SlashCommandBuilder,
    Events,
    Client,
    ActivityType,
    ModalBuilder,
    TextInputStyle,
    EmbedBuilder,
    PermissionsBitField,
    ButtonStyle,
    TextInputBuilder,
    ActionRowBuilder,
    ButtonBuilder
} = require("discord.js");

const { Database } = require("st.db");
const db = new Database("./Json-db/Bots/BroadcastDB.json");

module.exports = (client2) => {
    client2.on(Events.InteractionCreate, async (interaction) => {

        // ============================
        // زر إضافة توكن
        // ============================
        if (interaction.isButton() && interaction.customId === "add_token_button") {
            try {
                const modal = new ModalBuilder()
                    .setCustomId(`add_token_modal`)
                    .setTitle(`اضافة توكن بوت برودكاست`);

                const tokenn = new TextInputBuilder()
                    .setCustomId('the_token')
                    .setLabel(`التوكن`)
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(65)
                    .setMaxLength(85);

                modal.addComponents(new ActionRowBuilder().addComponents(tokenn));

                return interaction.showModal(modal);
            } catch (error) {
                return interaction.reply({ content: `${error.message}`, ephemeral: true });
            }
        }

        // ============================
        // استقبال المودال
        // ============================
        if (interaction.isModalSubmit() && interaction.customId === "add_token_modal") {
            try {
                // رد سريع قبل انتهاء الوقت
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ ephemeral: false }).catch(() => {});
                }

                const thetoken = interaction.fields.getTextInputValue(`the_token`);
                const thetokens = db.get(`tokens_${interaction.guild.id}`);

                if (thetokens && thetokens.includes(thetoken)) {
                    return interaction.editReply({ content: `**هذا التوكن موجود بالفعل**` });
                }

                // نرسل رد مبدئي قبل تسجيل الدخول
                await interaction.editReply({ content: `**جاري التحقق من التوكن...**` });

                // تسجيل الدخول للبوت
                const clienter = new Client({ intents: 131071 });

                await clienter.login(thetoken).catch(() => {
                    throw new Error("فشل تسجيل الدخول — التوكن غير صالح");
                });

                clienter.user.setActivity(`Hello I'm BC Bot`);

                const embed1 = new EmbedBuilder()
                    .setTitle(`**تم تسجيل الدخول بنجاح**`)
                    .setTimestamp()
                    .setColor('Aqua')
                    .addFields(
                        { name: `**اسم البوت**`, value: `\`\`\`${clienter.user.tag}\`\`\`` },
                        { name: `**ايدي البوت**`, value: `\`\`\`${clienter.user.id}\`\`\`` }
                    );

                const invitebot = new ButtonBuilder()
                    .setLabel('دعوة البوت')
                    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${clienter.user.id}&permissions=8&scope=bot`)
                    .setStyle(ButtonStyle.Link);

                const row = new ActionRowBuilder().addComponents(invitebot);

                await interaction.editReply({ embeds: [embed1], components: [row] });

                // حفظ التوكن
                let tokens = db.get(`tokens_${interaction.guild.id}`);
                if (!tokens) {
                    await db.set(`tokens_${interaction.guild.id}`, [thetoken]);
                } else {
                    await db.push(`tokens_${interaction.guild.id}`, thetoken);
                }

                // تحديث لوحة التحكم
                tokens = db.get(`tokens_${interaction.guild.id}`);
                const broadcast_msg = db.get(`broadcast_msg_${interaction.guild.id}`) ?? "لم يتم تحديد رسالة";
                const msgid = db.get(`msgid_${interaction.guild.id}`);

                if (msgid) {
                    const msg = await interaction.channel.messages.fetch(msgid).catch(() => null);
                    if (msg) {
                        const embed2 = new EmbedBuilder()
                            .setTitle(`**التحكم في البرودكاست**`)
                            .addFields(
                                { name: `**عدد البوتات المسجلة حاليا**`, value: `\`\`\`${tokens.length}\`\`\`` },
                                { name: `**رسالة البرودكاست الحالية**`, value: `\`\`\`${broadcast_msg}\`\`\`` }
                            )
                            .setDescription(`**يمكنك التحكم في البوت عن طريق الازرار**`)
                            .setColor('Aqua')
                            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                            .setTimestamp();

                        msg.edit({ embeds: [embed2] });
                    }
                }

            } catch (error) {
                return interaction.editReply({
                    content: `**الرجاء التأكد من التوكن أو تفعيل الخيارات الثلاثة الاخيرة من إعدادات البوت**`
                });
            }
        }
    });
};