handleMessage: async (message) => {
        if (message.author.bot) return;

        // 1) كشف المنشنات (كما هو)
        if (message.mentions.users.size > 0) {
            for (const mentionedUser of message.mentions.users.values()) {
                if (mentionedUser.id === message.author.id) continue;
                
                const afkData = afkDB.get(`afk_${mentionedUser.id}`);
                if (!afkData) continue; // إذا لم يكن الشخص AFK، تجاهل

                afkData.mentions.push({
                    userId: message.author.id,
                    messageUrl: message.url,
                    content: message.content.slice(0, 100),
                    time: Date.now()
                });
                await afkDB.set(`afk_${mentionedUser.id}`, afkData);

                const mentionEmbed = new EmbedBuilder()
                    .setColor("#ff9900")
                    .setTitle("💤 هذا الشخص في وضع AFK")
                    .setDescription(`<@${mentionedUser.id}> غائب حالياً.\n**السبب:** ${afkData.reason}`)
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel("الذهاب إلى رسالتك")
                        .setStyle(ButtonStyle.Link)
                        .setURL(message.url)
                );

                await message.channel.send({ embeds: [mentionEmbed], components: [row] });
            }
        }

        // 2) التحقق من الـ AFK (التعديل هنا)
        const afkData = afkDB.get(`afk_${message.author.id}`);
        
        // التعديل: تأكدنا أن afkData موجودة قبل إرسال أي رسالة "تم إلغاء"
        if (afkData && afkData.since) { 
            
            // حذف البيانات فوراً من قاعدة البيانات
            await afkDB.delete(`afk_${message.author.id}`);

            // استكمال بقية الكود لعرض الإشعار...
            let mentionsList = afkData.mentions && afkData.mentions.length > 0
                ? afkData.mentions.slice(-10).map((m, i) => `**${i + 1}.** <@${m.userId}> — <t:${Math.floor(m.time / 1000)}:R>`).join("\n")
                : "لا يوجد منشنات";

            const cancelEmbed = new EmbedBuilder()
                .setColor("#00ff99")
                .setTitle("✅ تم إلغاء وضع AFK")
                .setDescription(`مرحباً <@${message.author.id}>، تم إلغاء AFK.\n**السبب كان:** ${afkData.reason}`)
                .addFields({ name: `📬 المنشنات أثناء غيابك (${afkData.mentions?.length || 0})`, value: mentionsList })
                .setTimestamp();

            const rows = [];
            if (afkData.mentions && afkData.mentions.length > 0) {
                const buttons = afkData.mentions.slice(-5).map((m, i) => 
                    new ButtonBuilder()
                        .setLabel(`منشن ${i + 1}`)
                        .setStyle(ButtonStyle.Link)
                        .setURL(m.messageUrl)
                );
                rows.push(new ActionRowBuilder().addComponents(buttons));
            }

            const msg = await message.channel.send({
                embeds: [cancelEmbed],
                components: rows
            });

            setTimeout(() => msg.delete().catch(() => {}), 15000);
        }
    }