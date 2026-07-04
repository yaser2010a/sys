const {
    Events,
    Client,
    ActivityType,
    EmbedBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ButtonBuilder
} = require("discord.js");

const { Database } = require("st.db");
const db = new Database("./Json-db/Bots/BroadcastDB.json");

module.exports = (client27) => {
    client27.on(Events.InteractionCreate, async (interaction) => {

        // ============================
        // زر تشغيل لوحة الإرسال
        // ============================
        if (interaction.isButton() && interaction.customId === "run_broadcast_button") {

            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ ephemeral: true }).catch(() => {});
            }

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('send_online')
                        .setLabel('إرسال للأونلاين')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('send_offline')
                        .setLabel('إرسال للأوفلاين')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('send_all')
                        .setLabel('إرسال للجميع')
                        .setStyle(ButtonStyle.Primary)
                );

            return interaction.editReply({
                content: 'اختر نوع الإرسال:',
                components: [buttons]
            });
        }

        // ============================
        // أزرار الإرسال الثلاثة
        // ============================
        if (interaction.isButton() &&
            ["send_online", "send_offline", "send_all"].includes(interaction.customId)) {

            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ ephemeral: false }).catch(() => {});
            }

            const thetokens = db.get(`tokens_${interaction.guild.id}`);
            if (!thetokens || thetokens.length <= 0)
                return interaction.editReply({ content: `**لم يتم إضافة أي توكن لبوتات البرودكاست**` });

            const broadcast_msg = db.get(`broadcast_msg_${interaction.guild.id}`);
            if (!broadcast_msg)
                return interaction.editReply({ content: `**لم يتم تحديد رسالة البرودكاست**` });

            await interaction.guild.members.fetch();
            let allMembers = interaction.guild.members.cache.filter(m => !m.user.bot);

            if (interaction.customId === "send_online") {
                allMembers = allMembers.filter(mem =>
                    mem.presence?.status === 'online' ||
                    mem.presence?.status === 'dnd' ||
                    mem.presence?.status === 'idle' ||
                    mem.presence?.activities.some(a => a.type === ActivityType.Streaming)
                );
            }

            if (interaction.customId === "send_offline") {
                allMembers = allMembers.filter(mem =>
                    !mem.presence || mem.presence.status === 'offline'
                );
            }

            allMembers = allMembers.map(m => m.user.id);

            const botsNum = thetokens.length;
            const membersPerBot = Math.ceil(allMembers.length / botsNum);
            const submembers = [];

            for (let i = 0; i < allMembers.length; i += membersPerBot) {
                submembers.push(allMembers.slice(i, i + membersPerBot));
            }

            let donemembers = 0;
            let faildmembers = 0;

            const mesg = await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("**تم البدء في إرسال البرودكاست**")
                        .setColor("Aqua")
                        .setDescription(`**عدد الأعضاء: \`${allMembers.length}\`**`)
                ]
            });

            for (let i = 0; i < submembers.length; i++) {
                const token = thetokens[i];
                const clienter = new Client({ intents: 131071 });

                await clienter.login(token);

                for (const sub of submembers[i]) {
                    try {
                        await clienter.users.send(sub, `**${broadcast_msg}\n<@${sub}>**`);
                        donemembers++;
                    } catch {
                        faildmembers++;
                    }

                    const embed = new EmbedBuilder()
                        .setTitle("**جاري الإرسال...**")
                        .setColor("Aqua")
                        .setDescription(
                            `**عدد الأعضاء: \`${allMembers.length}\`\n` +
                            `🟢 تم الإرسال: \`${donemembers}\`\n` +
                            `🔴 فشل: \`${faildmembers}\`**`
                        );

                    await mesg.edit({ embeds: [embed] });
                }
            }

            const finalEmbed = new EmbedBuilder()
                .setTitle("**تم الانتهاء من إرسال البرودكاست**")
                .setColor("Green")
                .setDescription(
                    `**عدد الأعضاء: \`${allMembers.length}\`\n` +
                    `🟢 تم الإرسال: \`${donemembers}\`\n` +
                    `🔴 فشل: \`${faildmembers}\`**`
                );

            return mesg.edit({ embeds: [finalEmbed] });
        }
    });
};