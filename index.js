if (global.loadedEvents) return;
global.loadedEvents = true;

require('dotenv').config();
const path = require("path");

const {
    Client, Collection, GatewayIntentBits, ChannelType, AuditLogEvent, ActivityType,
    Partials, EmbedBuilder, ApplicationCommandOptionType, Events,
    ActionRowBuilder, ButtonBuilder, ButtonStyle, Message
} = require("discord.js");

const moment = require('moment');
const ms = require('ms');
const { Database } = require("st.db");
const { PermissionsBitField } = require('discord.js');


//=============قواعد السجن والخ.============
const fs = require('fs');
const config = require('./config.js');




const dbModule = require('./db');
global.dbUtils = dbModule.utils;
console.log('✅ تم تفعيل جدولة المهام التلقائية (JSON محلي)');
const client27
    = new Client({
        intents: 131071,
        shards: "auto",
        partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
    });
client27.commands = new Collection();


function wrapListener(fn, eventName) {
    return async (...args) => {
        try {
            await fn(...args);
        } catch (err) {
            console.log(`⚠️ خطأ داخل حدث [${eventName}]:`, err?.message || err);
        }
    };
}
const _originalOn = client27.on.bind(client27);
const _originalOnce = client27.once.bind(client27);
client27.on = (eventName, listener) => _originalOn(eventName, wrapListener(listener, eventName));
client27.once = (eventName, listener) => _originalOnce(eventName, wrapListener(listener, eventName));

// الملفات الي مو أوامر
const excluded = ['index.js', 'config.js', 'db.js', 'logger.js', 'utils.js', 'levels'];

const commandFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.js') && !excluded.includes(f));
for (const file of commandFiles) {
  const cmd = require(path.join(__dirname, file));
  if (cmd.name) client27.commands.set(cmd.name, cmd);
}




// ============ قواعد البيانات ============
const taxDB       = new Database("./Json-db/Bots/taxDB.json");
const autolineDB  = new Database("./Json-db/Bots/autolineDB.json");
const suggestionsDB = new Database("./Json-db/Bots/suggestionsDB.json");
const feedbackDB  = new Database("./Json-db/Bots/feedbackDB.json");
const giveawayDB  = new Database("./Json-db/Bots/giveawayDB.json");
const systemDB    = new Database("./Json-db/Bots/systemDB.json");
const shortcutDB  = new Database("./Json-db/Others/shortcutDB.json");
const protectDB   = new Database("./Json-db/Bots/protectDB.json");
const db          = new Database("./Json-db/Bots/BroadcastDB.json");
const logsDB      = new Database("./Json-db/Bots/logsDB.json");
const nadekoDB    = new Database("./Json-db/Bots/nadekoDB.json");
const one4allDB   = new Database("./Json-db/Bots/one4allDB.json");
const ticketDB    = new Database("./Json-db/Bots/ticketDB.json");

const { readdirSync } = require("fs");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { token, clientId, owner, prefix } = require('./config.js');

global.theowner = config.ownerID;

// ============ إنشاء الكلاينت ============

client27.commands = new Collection();
const rest = new REST({ version: '10' }).setToken(token);
client27.setMaxListeners(1000);

// ============ تحميل الأوامر ============
const folderPath = path.join(__dirname, 'slashcommand27');
client27.one4allSlashCommands = new Collection();
const one4allSlashCommands = [];
const ascii = require("ascii-table");
const table = new ascii("one4all commands").setJustify();

for (let folder of readdirSync(folderPath).filter(f => !f.includes("."))) {
    for (let file of readdirSync(`${folderPath}/${folder}`).filter(f => f.endsWith(".js"))) {
        try {
            let command = require(`${folderPath}/${folder}/${file}`);
            if (command && command.data) {
                one4allSlashCommands.push(command.data.toJSON());
                client27.one4allSlashCommands.set(command.data.name, command);
                table.addRow(`/${command.data.name}`, "🟢 Working");
            }
        } catch (err) {
            console.log(`❌ خطأ في تحميل ${file}:`, err.message);
        }
    }
}

// ============ تحميل الهاندلرز ============
if (!global.handlersLoaded) {
    global.handlersLoaded = true;
    require("./handlers/suggest")(client27);
    require('./handlers/tax4bot')(client27);
    require("./handlers/autorole")(client27);
    require('./handlers/claim')(client27);
    require('./handlers/close')(client27);
    require('./handlers/create')(client27);
    require('./handlers/reset')(client27);
    require('./handlers/support-panel')(client27);
    require('./handlers/joinGiveaway')(client27);
    require('./handlers/addToken')(client27);
    require('./handlers/info')(client27);
    require('./handlers/sendBroadcast')(client27);
    require('./handlers/setBroadcastMessage')(client27);
    require("./handlers/events")(client27);
}

// ============ تحميل الإيفنتات ============
if (!global.eventsLoaded) {
    global.eventsLoaded = true;
    for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
        try {
            const event = require(`./events/${file}`);
            if (event.once) {
                client27.once(event.name, (...args) => event.execute(...args, client27));
            } else {
                client27.on(event.name, (...args) => event.execute(...args, client27));
            }
        } catch (err) {
            console.log(`❌ خطأ في تحميل إيفنت ${file}:`, err.message);
        }
    }
}

// ============ معالجة الأخطاء ============
process.on('uncaughtException', (err) => console.log('uncaughtException:', err));
process.on('unhandledRejection', (reason) => console.log('unhandledRejection:', reason));
process.on('uncaughtExceptionMonitor', (reason) => console.log('uncaughtExceptionMonitor:', reason));

// ============ دالة مساعدة للحماية ============
async function sendProtectLog(guild, logRoomId, fields) {
    try {
        if (!logRoomId) return;
        const logRoom = guild.channels.cache.get(logRoomId);
        if (!logRoom) return;
        await logRoom.send({
            embeds: [new EmbedBuilder().setTitle('نظام الحماية').addFields(...fields)]
        });
    } catch {}
}

// ============ الجيف اواي ============
client27.on("ready", async () => {
    const theguild = client27.guilds.cache.first();
    if (!theguild) return;

    setInterval(async () => {
        try {
            let giveaways = giveawayDB.get(`giveaways_${theguild.id}`) || [];
            if (!Array.isArray(giveaways)) giveaways = Object.values(giveaways);
            if (!giveaways.length) return;

            for (const giveaway of giveaways) {
                let { messageid, channelid, entries, winners, prize, duration, dir1, dir2, ended } = giveaway;
                if (ended) continue;

                if (duration > 0) {
                    giveaway.duration--;
                    await giveawayDB.set(`giveaways_${theguild.id}`, giveaways);
                } else if (duration === 0) {
                    giveaway.duration--;
                    giveaway.ended = true;
                    await giveawayDB.set(`giveaways_${theguild.id}`, giveaways);

                    try {
                        const theroom = theguild.channels.cache.get(channelid);
                        if (!theroom) continue;
                        await theroom.messages.fetch(messageid);
                        const themsg = theroom.messages.cache.get(messageid);
                        if (!themsg) continue;

                        const disabledBtn = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setEmoji('🎉').setStyle(ButtonStyle.Primary).setCustomId('join_giveaway').setDisabled(true)
                        );

                        if (entries.length > 0 && entries.length >= winners) {
                            const theWinners = [];
                            const entriesCopy = [...entries];
                            for (let i = 0; i < winners; i++) {
                                const idx = Math.floor(Math.random() * entriesCopy.length);
                                theWinners.push(entriesCopy.splice(idx, 1)[0]);
                            }
                            await themsg.edit({ components: [disabledBtn] });
                            await themsg.reply({ content: `🎉 مبروك ${theWinners.join(', ')}! فزتم بـ **${prize}**!` });
                        } else {
                            await themsg.edit({ components: [disabledBtn] });
                            await themsg.reply({ content: '**لا يوجد عدد كافٍ من المشتركين**' });
                        }
                    } catch {}
                }
            }
        } catch {}
    }, 1000);
});

// ============ الضريبة التلقائية ============
client27.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    const roomid = taxDB.get(`tax_room_${message.guild.id}`);
    if (!roomid || message.channel.id !== roomid) return;

    let number = message.content;
    if (number.toLowerCase().endsWith("k")) number = parseFloat(number) * 1000;
    else if (number.toLowerCase().endsWith("m")) number = parseFloat(number) * 1000000;

    if (isNaN(number) || Number(number) == 0) return message.delete().catch(() => {});

    const taxLine  = taxDB.get(`tax_line_${message.guild.id}`);
    const taxMode  = taxDB.get(`tax_mode_${message.guild.id}`) || 'embed';
    const taxColor = taxDB.get(`tax_color_${message.guild.id}`) || '#0099FF';

    const number2 = parseInt(number);
    const tax  = Math.floor(number2 * 20 / 19 + 1);
    const tax3 = Math.floor(tax * 20 / 19 + 1);
    const tax4 = Math.floor(number2 * 0.02);
    const tax5 = Math.floor(tax3 + tax4);

    const description = `- المبلغ ** : ${number2}**\n- ضريبة برو بوت **: ${tax}**\n- المبلغ كامل مع ضريبة الوسيط **: ${tax3}**\n- نسبة الوسيط 2 % **: ${tax4}**\n- الضريبة كاملة مع نسبة الوسيط **: ${tax5}**`;

    const btn1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`tax_${tax}`).setLabel('Tax').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`mediator_${tax5}`).setLabel('Mediator').setStyle(ButtonStyle.Secondary)
    );

    if (taxMode === 'embed') {
        const embed1 = new EmbedBuilder().setColor(taxColor).setDescription(description).setThumbnail(message.guild.iconURL({ dynamic: true }));
        await message.reply({ embeds: [embed1], components: [btn1] });
    } else {
        await message.reply({ content: description, components: [btn1] });
    }
    if (taxLine) await message.channel.send({ files: [taxLine] }).catch(() => {});
});

// ============ الخط التلقائي (يدوي) ============
client27.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    const line = autolineDB.get(`line_${message.guild.id}`);
    const lineMode = autolineDB.get(`line_mode_${message.guild.id}`) || 'image';
    if ((message.content === "-" || message.content === "خط") && line && message.member.permissions.has('ManageMessages')) {
        await message.delete().catch(() => {});
        if (lineMode === 'link') return message.channel.send({ content: line });
        return message.channel.send({ files: [line] });
    }
});

// ============ الخط التلقائي (قنوات) ============
client27.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    let autoChannels = autolineDB.get(`line_channels_${message.guild.id}`) || [];
    if (!Array.isArray(autoChannels)) autoChannels = Object.values(autoChannels);
    if (!autoChannels.length || !autoChannels.includes(message.channel.id)) return;
    const line = autolineDB.get(`line_${message.guild.id}`);
    const lineMode = autolineDB.get(`line_mode_${message.guild.id}`) || 'image';
    if (!line) return;
    if (lineMode === 'link') return message.channel.send({ content: line });
    return message.channel.send({ files: [line] });
});

// ============ تقييم المصممين ============
client27.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (message.content !== 'قيمني') return;
    const designer = message.author;
    const designRole = '1271443664194895894';
    if (!message.member.roles.cache.has(designRole)) return;

    const filter = r => !r.author.bot && r.author.id !== designer.id;
    await message.channel.send(`من فضلك أكتب تقييمك للتصاميم، <@${designer.id}>`);
    const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000 }).catch(() => null);
    if (!collected || collected.size === 0) return message.channel.send('انتهى الوقت.');

    const user = collected.first().author;
    const userText = collected.first().content;
    const rankroom = '1278108478828843118';

    const st1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('1star').setLabel('نجمة 1').setEmoji('⭐').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('2star').setLabel('نجمتين 2').setEmoji('⭐').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('3star').setLabel('3 نجوم').setEmoji('⭐').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('4star').setLabel('4 نجوم').setEmoji('⭐').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('5star').setLabel('5 نجوم').setEmoji('⭐').setStyle(ButtonStyle.Primary)
    );
    const starMsg = await message.channel.send({ content: 'اختر عدد النجوم:', components: [st1] });
    const collector = starMsg.createMessageComponentCollector({ filter: i => !i.user.bot && i.user.id !== designer.id, time: 60000 });

    collector.on('collect', async interaction => {
        if (!interaction.isButton()) return;
        const stars = { '1star': '⭐', '2star': '⭐⭐', '3star': '⭐⭐⭐', '4star': '⭐⭐⭐⭐', '5star': '⭐⭐⭐⭐⭐' };
        const embedrank = new EmbedBuilder().setDescription(`${userText}\n**عدد النجوم:**\n${stars[interaction.customId]}`).setColor('#808080').setAuthor({ name: user.username, iconURL: user.displayAvatarURL() });
        const rankChannel = client27.channels.cache.get(rankroom);
        if (rankChannel) {
            await rankChannel.send({ content: `المصمم: <@${designer.id}>`, embeds: [embedrank] });
            await interaction.reply({ content: 'تم إرسال تقييمك بنجاح!', flags: 64 });
        } else {
            await interaction.reply({ content: 'روم التقييم غير موجود.', flags: 64 });
        }
        await interaction.message.delete().catch(() => {});
        collector.stop();
    });
});

// ============ البرودكاست ============
client27.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(`${prefix}obc`) && !message.content.startsWith(`${prefix}bc`)) return;
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.reply('❌ ليس لديك الصلاحيات.');

    const broadcastMsg = message.content.split(' ').slice(1).join(' ');
    if (!broadcastMsg) return message.reply('يرجى كتابة رسالة بعد الأمر.');

    await message.guild.members.fetch();
    let allMembers = message.guild.members.cache.filter(m => !m.user.bot);
    if (message.content.startsWith(`${prefix}obc`)) {
        allMembers = allMembers.filter(m => ['online','dnd','idle'].includes(m.presence?.status));
    }
    const memberIds = [...allMembers.keys()];
    const thetokens = db.get(`tokens_${message.guild.id}`) || [];
    if (!thetokens.length) return message.reply('❌ لا يوجد توكنات.');

    const membersPerBot = Math.ceil(memberIds.length / thetokens.length);
    let done = 0, failed = 0;

    const statusEmbed = () => new EmbedBuilder().setTitle('📢 البرودكاست').setColor('Aqua')
        .setDescription(`⚫ الكل: \`${memberIds.length}\`\n🟢 تم: \`${done}\`\n🔴 فشل: \`${failed}\``);

    const msg = await message.channel.send({ embeds: [statusEmbed()] });

    for (let i = 0; i < thetokens.length; i++) {
        const chunk = memberIds.slice(i * membersPerBot, (i + 1) * membersPerBot);
        try {
            const clienter = new Client({ intents: 131071 });
            await clienter.login(thetokens[i]);
            for (const sub of chunk) {
                try {
                    const user = await clienter.users.fetch(sub);
                    await user.send(`${broadcastMsg}\n<@${sub}>`);
                    done++;
                } catch { failed++; }
                await msg.edit({ embeds: [statusEmbed()] }).catch(() => {});
            }
        } catch { failed += chunk.length; }
    }
});

// ============ تقييم الإداريين ============
client27.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    const cmd = shortcutDB.get(`rate_cmd_${message.guild.id}`) || null;
    if (message.content !== `${prefix}تقييم` && message.content !== cmd) return;

    const stafer = message.author;
    const staffRole = feedbackDB.get(`staff_role_${message.guild.id}`);
    if (!staffRole || !message.member.roles.cache.has(staffRole)) return;

    const filter = r => !r.author.bot && r.author.id !== stafer.id;
    await message.channel.send(`من فضلك أكتب تقييمك للاداري <@${stafer.id}>`);
    const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000 }).catch(() => null);
    if (!collected || collected.size === 0) return message.channel.send('انتهى الوقت.');

    const user = collected.first().author;
    const userText = collected.first().content;
    const rankroom = feedbackDB.get(`rank_room_${message.guild.id}`);

    const st1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('1star').setLabel('نجمة 1').setEmoji('⭐').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('2star').setLabel('نجمتين 2').setEmoji('⭐').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('3star').setLabel('3 نجوم').setEmoji('⭐').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('4star').setLabel('4 نجوم').setEmoji('⭐').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('5star').setLabel('5 نجوم').setEmoji('⭐').setStyle(ButtonStyle.Success)
    );
    const starMsg = await message.channel.send({ content: 'اختر عدد النجوم:', components: [st1] });
    const collector = starMsg.createMessageComponentCollector({ filter: i => !i.user.bot && i.user.id !== stafer.id, time: 60000 });

    collector.on('collect', async interaction => {
        if (!interaction.isButton()) return;
        const stars = { '1star': '⭐', '2star': '⭐⭐', '3star': '⭐⭐⭐', '4star': '⭐⭐⭐⭐', '5star': '⭐⭐⭐⭐⭐' };
        const embedrank = new EmbedBuilder().setDescription(`${userText}\n**عدد النجوم:**\n${stars[interaction.customId]}`).setColor('Random').setAuthor({ name: user.username, iconURL: user.displayAvatarURL() });
        const rankChannel = client27.channels.cache.get(rankroom);
        if (rankChannel) {
            await rankChannel.send({ content: `الاداري: <@${stafer.id}>`, embeds: [embedrank] });
            await interaction.reply({ content: 'تم إرسال تقييمك!', flags: 64 });
        } else {
            await interaction.reply({ content: 'روم التقييم غير موجود.', flags: 64 });
        }
        await interaction.message.delete().catch(() => {});
        collector.stop();
    });
});

// ============ الاقتراحات ============
client27.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    const chan = suggestionsDB.get(`suggestions_room_${message.guild.id}`);
    if (!chan || message.channel.id !== chan) return;

    const line = suggestionsDB.get(`line_${message.guild.id}`);
    const suggestionMode = suggestionsDB.get(`suggestion_mode_${message.guild.id}`) || 'buttons';
    const threadMode = suggestionsDB.get(`thread_mode_${message.guild.id}`) || 'enabled';

    const embed = new EmbedBuilder().setColor('Random').setTimestamp()
        .setTitle(`** > ${message.content} **`)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

    let send;
    if (suggestionMode === 'buttons') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ok_button').setLabel('0').setEmoji('✔️').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('no_button').setLabel('0').setEmoji('✖️').setStyle(ButtonStyle.Danger)
        );
        send = await message.channel.send({ embeds: [embed], components: [row] }).catch(() => null);
        if (send) {
            await suggestionsDB.set(`${send.id}_ok`, 0);
            await suggestionsDB.set(`${send.id}_no`, 0);
        }
    } else {
        send = await message.channel.send({ embeds: [embed] }).catch(() => null);
        if (send) { await send.react('✔️'); await send.react('❌'); }
    }
    if (send && threadMode === 'enabled') {
        await send.startThread({ name: 'Comments - تعليقات' }).then(t => t.send(`** - رايك حول : \`${message.content}\` **`)).catch(() => {});
    }
    if (line) await message.channel.send({ files: [line] }).catch(() => {});
    await message.delete().catch(() => {});
});

// ============ الآراء ============
client27.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    const chan = feedbackDB.get(`feedback_room_${message.guild.id}`);
    if (!chan || message.channel.id !== chan) return;

    const line = feedbackDB.get(`line_${message.guild.id}`);
    const feedbackMode = feedbackDB.get(`feedback_mode_${message.guild.id}`) || 'embed';
    const feedbackEmoji = feedbackDB.get(`feedback_emoji_${message.guild.id}`) || '❤';

    const embed = new EmbedBuilder().setColor('Random').setTimestamp()
        .setTitle(`** > ${message.content} **`)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

    if (feedbackMode === 'embed') {
        await message.delete().catch(() => {});
        const themsg = await message.channel.send({ content: `**<@${message.author.id}> شكرا لمشاركتنا رأيك :tulip:**`, embeds: [embed] });
        await themsg.react('❤'); await themsg.react('❤️‍🔥');
    } else {
        await message.react(feedbackEmoji).catch(() => {});
    }
    if (line) await message.channel.send({ files: [line] }).catch(() => {});
});

// ============ التذكرة - إغلاق ============
client27.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (message.content !== `${prefix}close`) return;
    const ticket = ticketDB.get(`TICKET-PANEL_${message.channel.id}`);
    if (!ticket) return;

    await message.channel.permissionOverwrites.edit(ticket.author, { ViewChannel: false }).catch(() => {});
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('delete').setLabel('Delete').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('Open').setLabel('Open').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('Tran').setLabel('Transcript').setStyle(ButtonStyle.Secondary)
    );
    await message.reply({ embeds: [
        new EmbedBuilder().setDescription(`تم اغلاق تذكرة بواسطة ${message.author}`).setColor('Yellow'),
        new EmbedBuilder().setDescription('```لوحة فريق الدعم.```').setColor('DarkButNotBlack')
    ], components: [row] });

    const logChannel = message.guild.channels.cache.get(ticketDB.get(`LogsRoom_${message.guild.id}`));
    if (logChannel) {
        await logChannel.send({ embeds: [new EmbedBuilder()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTitle('Close Ticket')
            .addFields(
                { name: 'Name Ticket', value: message.channel.name },
                { name: 'Owner Ticket', value: String(ticket.author) },
                { name: 'Closed By', value: String(message.author) }
            )] });
    }
});

// ============ التذكرة - حذف ============
client27.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (message.content !== `${prefix}delete`) return;
    const supportRoleId = ticketDB.get(`TICKET-PANEL_${message.channel.id}`)?.Support;
    if (!supportRoleId || !message.member.roles.cache.has(supportRoleId)) return message.reply({ content: ':x: Only Support', flags: 64 });
    if (!ticketDB.has(`TICKET-PANEL_${message.channel.id}`)) return message.reply({ content: "This channel isn't a ticket", flags: 64 });

    await message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('Ticket will be deleted in a few seconds')] });
    setTimeout(() => message.channel.delete().catch(() => {}), 4500);

    const Ticket = ticketDB.get(`TICKET-PANEL_${message.channel.id}`);
    const Log = message.guild.channels.cache.get(ticketDB.get(`LogsRoom_${message.guild.id}`));
    if (Log) {
        await Log.send({ embeds: [new EmbedBuilder()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTitle('Delete Ticket')
            .addFields(
                { name: 'Name Ticket', value: message.channel.name },
                { name: 'Owner Ticket', value: String(Ticket.author) },
                { name: 'Deleted By', value: String(message.author) }
            )] });
    }
    ticketDB.delete(`TICKET-PANEL_${message.channel.id}`);
});

// ============ say ============
client27.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    const cmd = shortcutDB.get(`say_cmd_${message.guild.id}`) || null;
    if (!message.content.startsWith(`${prefix}say`) && (!cmd || !message.content.startsWith(cmd))) return;
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
    const content = message.content.slice((message.content.startsWith(`${prefix}say`) ? `${prefix}say` : cmd).length).trim();
    if (!content) return message.channel.send('من فضلك اكتب شيئاً بعد الأمر.');
    const image = message.attachments.first()?.url || null;
    await message.delete().catch(() => {});
    await message.channel.send({ content, files: image ? [image] : [] });
});

// ============ clear ============
client27.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    const cmd = shortcutDB.get(`clear_cmd_${message.guild.id}`) || null;
    if (!message.content.startsWith(`${prefix}clear`) && (!cmd || !message.content.startsWith(cmd))) return;
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
    const amount = parseInt(message.content.split(' ')[1]) || 99;
    if (isNaN(amount) || amount <= 0 || amount > 100) return;
    const fetched = await message.channel.messages.fetch({ limit: amount });
    const toDelete = fetched.filter(m => Date.now() - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000);
    await message.channel.bulkDelete(toDelete).catch(() => {});
});

// ============ tax command ============
client27.on('messageCreate', async (message) => {
    if (!message.guild) return;
    const cmd = shortcutDB.get(`tax_cmd_${message.guild.id}`) || null;
    if (!message.content.startsWith(`${prefix}tax`) && (!cmd || !message.content.startsWith(cmd))) return;
    const arg = message.content.startsWith(`${prefix}tax`) ? message.content.slice(`${prefix}tax`.length).trim() : message.content.slice(cmd.length).trim();
    let number = arg.toLowerCase().endsWith('k') ? parseFloat(arg) * 1000 : arg.toLowerCase().endsWith('m') ? parseFloat(arg) * 1000000 : parseFloat(arg);
    if (isNaN(number)) return message.reply('يرجى إدخال رقم صحيح.');
    await message.reply(`${Math.floor(number * 20 / 19 + 1)}`);
});

// ============ come ============
client27.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    const cmd = shortcutDB.get(`come_cmd_${message.guild.id}`) || null;
    if (!message.content.startsWith(`${prefix}come`) && (!cmd || !message.content.startsWith(cmd))) return;
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply('يجب أن تملك صلاحية ManageMessages.');
    const target = message.mentions.members.first() || message.guild.members.cache.get(message.content.split(/\s+/)[1]);
    if (!target) return message.reply('من فضلك قم بعمل منشن لشخص أو ضع الإيدي.');
    try {
        await target.send(`**تم استدعائك بواسطة : ${message.author}\nفي : ${message.channel}**`);
        await message.reply('**تم الارسال للشخص بنجاح**');
    } catch { await message.reply('**لم استطع الارسال للشخص**'); }
});

// ============ lock / unlock / hide / unhide ============
const channelCmds = {
    lock:   { perm: 'SendMessages', val: false, msg: 'locked' },
    unlock: { perm: 'SendMessages', val: true,  msg: 'unlocked' },
    hide:   { perm: 'ViewChannel',  val: false, msg: 'hidden' },
    unhide: { perm: 'ViewChannel',  val: true,  msg: 'unhidded' }
};
client27.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    for (const [cmdName, cfg] of Object.entries(channelCmds)) {
        const cmd = shortcutDB.get(`${cmdName}_cmd_${message.guild.id}`) || null;
        if (message.content !== `${prefix}${cmdName}` && message.content !== cmd) continue;
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return message.reply({ content: '**لا تمتلك صلاحية لفعل ذلك**' });
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { [cfg.perm]: cfg.val }).catch(() => {});
        return message.reply({ content: `**${message.channel} has been ${cfg.msg}**` });
    }
});

// ============ server info ============
client27.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    const cmd = shortcutDB.get(`server_cmd_${message.guild.id}`) || null;
    if (message.content !== `${prefix}server` && message.content !== cmd) return;
    const g = message.guild;
    const embed = new EmbedBuilder()
        .setAuthor({ name: g.name, iconURL: g.iconURL({ dynamic: true }) })
        .setColor('Random')
        .setThumbnail(g.iconURL({ dynamic: true }))
        .addFields(
            { name: '🆔 Server ID', value: g.id },
            { name: '📆 Created On', value: `<t:${parseInt(g.createdTimestamp / 1000)}:R>` },
            { name: '👑 Owned By', value: `<@${g.ownerId}>` },
            { name: `👥 Members (${g.memberCount})`, value: `${g.premiumSubscriptionCount} Boosts ✨` },
            { name: `💬 Channels (${g.channels.cache.size})`, value: `**${g.channels.cache.filter(c => c.type === ChannelType.GuildText).size}** Text | **${g.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size}** Voice` },
            { name: '🌍 Others', value: `Verification: ${g.verificationLevel}` }
        );
    return message.reply({ embeds: [embed] });
});

// ============ test ============
client27.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;
    if (message.content === "test") message.reply('works fine');
});

// ============ الرد التلقائي ============
client27.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    let autoReplys = one4allDB.get(`replys_${message.guild.id}`) || [];
    if (!Array.isArray(autoReplys)) autoReplys = Object.values(autoReplys);
    if (!autoReplys.length) return;
    const data = autoReplys.find(r => r && r.word === message.content);
    if (data) message.reply(`${data.reply}`);
});

// ============ الحماية من البوتات ============
client27.on("guildMemberAdd", async (member) => {
    try {
        if (!member.user.bot) return;
        const status = protectDB.get(`antibots_status_${member.guild.id}`);
        if (status !== 'on') return;
        const logRoomId = protectDB.get(`protectLog_room_${member.guild.id}`);
        await sendProtectLog(member.guild, logRoomId, [
            { name: 'العضو :', value: `${member.user.username} \`${member.id}\`` },
            { name: 'السبب :', value: 'نظام الحماية من البوتات' },
            { name: 'العقاب :', value: 'طرد البوت' }
        ]);
        await member.kick().catch(() => {});
    } catch {}
});

// ============ الحماية من حذف الرومات ============
client27.once('ready', async () => {
    const guild = client27.guilds.cache.first();
    if (!guild) return;
    const guildid = guild.id;
    if (protectDB.get(`antideleterooms_status_${guildid}`) !== 'on') return;
    setInterval(async () => {
        try {
            const users = protectDB.get(`roomsdelete_users_${guildid}`) || [];
            const limit = protectDB.get(`antideleterooms_limit_${guildid}`);
            for (const user of users) {
                const { userid, limit: ul, newReset } = user;
                if (moment().isSameOrAfter(newReset)) {
                    user.limit = 0;
                    user.newReset = moment().add(1, 'day').format('YYYY-MM-DD');
                }
                if (ul > limit) {
                    const member = guild.members.cache.get(userid);
                    if (member) await member.kick().catch(() => {});
                }
            }
            await protectDB.set(`roomsdelete_users_${guildid}`, users);
        } catch {}
    }, 6000);
});

client27.on('channelDelete', async (channel) => {
    try {
        const guildid = channel.guild.id;
        if (protectDB.get(`antideleterooms_status_${guildid}`) !== 'on') return;
        const logs = await channel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelDelete });
        const { executor } = logs.entries.first();
        if (executor.id === client27.user.id) return;
        let users = protectDB.get(`roomsdelete_users_${guildid}`) || [];
        const endTime = moment().add(1, 'day').format('YYYY-MM-DD');
        const idx = users.findIndex(u => u.userid === executor.id);
        if (idx === -1) users.push({ userid: executor.id, limit: 1, newReset: endTime });
        else users[idx].limit++;
        const limit = protectDB.get(`antideleterooms_limit_${guildid}`);
        const userEntry = users.find(u => u.userid === executor.id);
        if (userEntry.limit > limit) {
            const member = channel.guild.members.cache.get(executor.id);
            const logRoomId = protectDB.get(`protectLog_room_${channel.guild.id}`);
            await sendProtectLog(channel.guild, logRoomId, [
                { name: 'العضو :', value: `${executor.username} \`${executor.id}\`` },
                { name: 'السبب :', value: 'حذف رومات' },
                { name: 'العقاب :', value: 'طرد العضو' }
            ]);
            if (member) await member.kick().catch(() => {});
            users = users.filter(u => u.userid !== executor.id);
        }
        await protectDB.set(`roomsdelete_users_${guildid}`, users);
    } catch {}
});

// ============ الحماية من حذف الرتب ============
client27.once('ready', async () => {
    const guild = client27.guilds.cache.first();
    if (!guild) return;
    const guildid = guild.id;
    if (protectDB.get(`antideleteroles_status_${guildid}`) !== 'on') return;
    setInterval(async () => {
        try {
            const users = protectDB.get(`rolesdelete_users_${guildid}`) || [];
            const limit = protectDB.get(`antideleteroles_limit_${guildid}`);
            for (const user of users) {
                if (moment().isSameOrAfter(user.newReset)) { user.limit = 0; user.newReset = moment().add(1,'day').format('YYYY-MM-DD'); }
                if (user.limit > limit) { const m = guild.members.cache.get(user.userid); if (m) await m.kick().catch(() => {}); }
            }
            await protectDB.set(`rolesdelete_users_${guildid}`, users);
        } catch {}
    }, 6000);
});

client27.on('roleDelete', async (role) => {
    try {
        const guildid = role.guild.id;
        if (protectDB.get(`antideleteroles_status_${guildid}`) !== 'on') return;
        const logs = await role.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleDelete });
        const { executor } = logs.entries.first();
        if (executor.id === client27.user.id) return;
        let users = protectDB.get(`rolesdelete_users_${guildid}`) || [];
        const endTime = moment().add(1,'day').format('YYYY-MM-DD');
        const idx = users.findIndex(u => u.userid === executor.id);
        if (idx === -1) users.push({ userid: executor.id, limit: 1, newReset: endTime });
        else users[idx].limit++;
        const limit = protectDB.get(`antideleteroles_limit_${guildid}`);
        const userEntry = users.find(u => u.userid === executor.id);
        if (userEntry.limit > limit) {
            const member = role.guild.members.cache.get(executor.id);
            const logRoomId = protectDB.get(`protectLog_room_${role.guild.id}`);
            await sendProtectLog(role.guild, logRoomId, [
                { name: 'العضو :', value: `${executor.username} \`${executor.id}\`` },
                { name: 'السبب :', value: 'حذف رتب' },
                { name: 'العقاب :', value: 'طرد العضو' }
            ]);
            if (member) await member.kick().catch(() => {});
            users = users.filter(u => u.userid !== executor.id);
        }
        await protectDB.set(`rolesdelete_users_${guildid}`, users);
    } catch {}
});

// ============ الحماية من البان ============
client27.once('ready', async () => {
    const guild = client27.guilds.cache.first();
    if (!guild) return;
    const guildid = guild.id;
    if (protectDB.get(`ban_status_${guildid}`) !== 'on') return;
    setInterval(async () => {
        try {
            const users = protectDB.get(`ban_users_${guildid}`) || [];
            const limit = protectDB.get(`ban_limit_${guildid}`);
            for (const user of users) {
                if (moment().isSameOrAfter(user.newReset)) { user.limit = 0; user.newReset = moment().add(1,'day').format('YYYY-MM-DD'); }
                if (user.limit > limit) { const m = guild.members.cache.get(user.userid); if (m) await m.kick().catch(() => {}); }
            }
            await protectDB.set(`ban_users_${guildid}`, users);
        } catch {}
    }, 6000);
});

async function handleBanProtect(guild, executor) {
    try {
        const guildid = guild.id;
        if (executor.id === client27.user.id) return;
        let users = protectDB.get(`ban_users_${guildid}`) || [];
        const endTime = moment().add(1,'day').format('YYYY-MM-DD');
        const idx = users.findIndex(u => u.userid === executor.id);
        if (idx === -1) users.push({ userid: executor.id, limit: 1, newReset: endTime });
        else users[idx].limit++;
        const limit = protectDB.get(`ban_limit_${guildid}`);
        const userEntry = users.find(u => u.userid === executor.id);
        if (userEntry.limit > limit) {
            const member = guild.members.cache.get(executor.id);
            const logRoomId = protectDB.get(`protectLog_room_${guild.id}`);
            await sendProtectLog(guild, logRoomId, [
                { name: 'العضو :', value: `${executor.username} \`${executor.id}\`` },
                { name: 'السبب :', value: 'حظر/طرد أعضاء' },
                { name: 'العقاب :', value: 'طرد العضو' }
            ]);
            if (member) await member.kick().catch(() => {});
            users = users.filter(u => u.userid !== executor.id);
        }
        await protectDB.set(`ban_users_${guildid}`, users);
    } catch {}
}

client27.on('guildBanAdd', async (ban) => {
    if (protectDB.get(`ban_status_${ban.guild.id}`) !== 'on') return;
    const logs = await ban.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd });
    const { executor } = logs.entries.first();
    await handleBanProtect(ban.guild, executor);
});

client27.on('guildMemberRemove', async (member) => {
    if (protectDB.get(`ban_status_${member.guild.id}`) !== 'on') return;
    if (member.id === client27.user.id) return;
    const logs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberKick }).catch(() => null);
    if (!logs) return;
    const { executor } = logs.entries.first();
    await handleBanProtect(member.guild, executor);
});

// ============ الدعوات ============
const invites = {};
client27.on('inviteCreate', invite => {
    if (!invites[invite.guild.id]) invites[invite.guild.id] = new Map();
    invites[invite.guild.id].set(invite.code, invite.uses);
});
client27.on('inviteDelete', invite => {
    if (invites[invite.guild.id]) invites[invite.guild.id].delete(invite.code);
});

// ============ الترحيب ============
client27.on('guildMemberAdd', async (member) => {
    try {
        const welcomeChannelId = systemDB.get(`welcome_channel_${member.guild.id}`);
        const welcomeRoleId    = systemDB.get(`welcome_role_${member.guild.id}`);
        const welcomeImage     = systemDB.get(`welcome_image_${member.guild.id}`);

        if (welcomeRoleId) {
            const role = member.guild.roles.cache.get(welcomeRoleId);
            if (role) await member.roles.add(role).catch(() => {});
        }

        const newInvites = await member.guild.invites.fetch().catch(() => new Map());
        const oldInvites = invites[member.guild.id] || new Map();
        const usedInvite = newInvites.find(inv => (inv.uses || 0) > (oldInvites.get(inv.code) || 0));
        const inviterMention = usedInvite?.inviter ? `<@${usedInvite.inviter.id}>` : 'Unknown';

        const embed = new EmbedBuilder()
            .setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL({ dynamic: true }) })
            .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL({ dynamic: true }) })
            .setColor('#787575').setTitle('Welcome to the Server!')
            .setDescription(`Hello ${member}, welcome to **${member.guild.name}**!`)
            .addFields(
                { name: 'Username', value: member.user.tag, inline: true },
                { name: 'Invited By', value: inviterMention, inline: true },
                { name: 'Invite Used', value: usedInvite ? `||${usedInvite.code}||` : 'Direct Join', inline: true },
                { name: "You're Member", value: `${member.guild.memberCount}`, inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL()).setTimestamp();

        if (welcomeImage) embed.setImage(welcomeImage);
        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
        if (welcomeChannel) await welcomeChannel.send({ embeds: [embed] });
        invites[member.guild.id] = new Map(newInvites.map(inv => [inv.code, inv.uses]));
    } catch {}
});

// ============ ناديكو ============
client27.on("guildMemberAdd", async (member) => {
    try {
        const rooms = nadekoDB.get(`rooms_${member.guild.id}`);
        const msg   = nadekoDB.get(`message_${member.guild.id}`);
        if (!rooms || !rooms.length || !msg) return;
        for (const roomId of rooms) {
            const room = member.guild.channels.cache.get(roomId);
            if (!room) continue;
            const sent = await room.send({ content: `${member} - ${msg}` });
            setTimeout(() => sent.delete().catch(() => {}), 3000);
        }
    } catch {}
});

// ============ الإنتراكشن - قوائم المساعدة ============
function buildHelpButtons(active) {
    const items = [
        ['help_tax','ضريبة','💰'], ['help_autoline','خط تلقائي','🤖'], ['help_suggestion','اقتراحات','💡'],
        ['help_feedback','اراء','💭'], ['help_system','سيستم','⚙️'], ['help_ticket','تكت','🎫'],
        ['help_giveaway','جيف اوي','🎁'], ['help_protection','حماية','🛡️'], ['help_logs','لوج','📜'],
        ['help_apply','تقديمات','📝'], ['help_broadcast','برودكاست','📢'], ['help_nadeko','ناديكو','⏳'],
        ['help_autoreply','رد تلقائي','💎'], ['help_autorole','رتب تلقائية','⚡']
    ];
    const rows = [];
    for (let i = 0; i < items.length; i += 5) {
        rows.push(new ActionRowBuilder().addComponents(
            items.slice(i, i + 5).map(([id, label, emoji]) =>
                new ButtonBuilder().setCustomId(id).setLabel(label).setEmoji(emoji)
                    .setStyle(ButtonStyle.Secondary).setDisabled(id === active)
            )
        ));
    }
    return rows;
}

const helpData = {
    help_tax: { title: 'ضريبة', fields: [
        ['/set-tax-room','لتحديد روم الضريبة التلقائية'],['/set-tax-line','لتحديد الخط'],
        ['/tax-mode','لتحديد شكل الضريبة'],[`/tax | ${prefix}tax`,'لحساب ضريبة بروبوت']
    ]},
    help_autoline: { title: 'خط تلقائي', fields: [
        ['/set-autoline-line','لتحديد الخط'],['/add-autoline-channel','لاضافة روم'],
        ['/remove-autoline-channel','لازالة روم'],['/line-mode','تحديد طريقة الارسال'],['خط | -','لارسال خط']
    ]},
    help_suggestion: { title: 'اقتراحات', fields: [
        ['/set-suggestions-line','لتحديد خط الاقتراحات'],['/set-suggestions-room','لتحديد روم'],['/suggestions-mode','لتحديد الشكل']
    ]},
    help_feedback: { title: 'آراء', fields: [
        ['/set-feedback-line','لتحديد خط الاراء'],['/set-feedback-room','لتحديد روم'],
        ['/feedback-mode','امبد أو رياكشن'],['/setup-rating','نظام تقييم الاداريين'],[`${prefix}تقييم`,'طلب تقييم']
    ]},
    help_system: { title: 'سيستم', fields: [
        ['/avatar','لرؤية الافتار'],['/server','معلومات السيرفر'],['/user','معلومات الحساب'],
        ['/banner','لرؤية البانر'],['/setup-welcome','نظام الترحيب'],['/ban','باند'],['/kick','طرد'],
        ['/clear','حذف رسائل'],['/mute','ميوت'],['/timeout','تايم اوت'],['/role','رتبة'],
        ['/say','قول كلام'],['/lock','قفل روم'],['/hide','اخفاء روم']
    ]},
    help_ticket: { title: 'تكت', fields: [
        ['/setup-ticket','انشاء تكت'],['/add-ticket-button','اضافة زر'],['/to-select','سلكت منيو'],
        ['/set-ticket-log','روم اللوغ'],['/add-user','اضافة شخص'],['/remove-user','ازالة شخص'],
        ['/rename','تغيير اسم'],['/close','اغلاق'],['/delete','حذف']
    ]},
    help_giveaway: { title: 'جيف اواي', fields: [['/gstart','بدء'],['/gend','انهاء'],['/greroll','اعادة الفائزين']] },
    help_protection: { title: 'حماية', fields: [
        ['/anti-ban','حماية من الباند'],['/anti-bots','حماية من البوتات'],
        ['/anti-delete-roles','حماية من حذف الرتب'],['/anti-delete-rooms','حماية من حذف الرومات'],
        ['/set-protect-logs','روم لوج الحماية']
    ]},
    help_logs: { title: 'لوج', fields: [['/logs-info','معلومات اللوج'],['/setup-logs','تسطيب اللوج']] },
    help_apply: { title: 'تقديمات', fields: [['/setup-apply','تسطيب'],['/new-apply','تقديم جديد'],['/dm-mode','رسالة الخاص'],['/close-apply','انهاء']] },
    help_broadcast: { title: 'برودكاست', fields: [
        ['/send-broadcast-panel','بانل البرودكاست'],[`${prefix}obc`,'رسالة للأونلاين'],
        [`${prefix}bc`,'رسالة للكل'],['/remove-token','ازالة توكن'],['/remove-all-tokens','ازالة كل التوكنات']
    ]},
    help_nadeko: { title: 'ناديكو', fields: [['/set-message','الرسالة عند الدخول'],['/add-nadeko-room','اضافة روم'],['/remove-nadeko-room','ازالة روم']] },
    help_autoreply: { title: 'رد تلقائي', fields: [['/autoreply-add','اضافة رد'],['/autoreply-remove','ازالة رد'],['/autoreply-list','عرض الردود']] },
    help_autorole: { title: 'رتب تلقائية', fields: [['/new-panel','انشاء بنل رتب'],['/add-button','اضافة زر']] }
};

client27.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    const data = helpData[interaction.customId];
    if (!data) return;
    try {
        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTitle('قائمة اوامر البوت')
            .addFields(data.fields.map(([name, value]) => ({ name: `\`${name}\``, value })))
            .setTimestamp()
            .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setColor('DarkButNotBlack');
        await interaction.update({ embeds: [embed], components: buildHelpButtons(interaction.customId) });
    } catch {}
});

// ============ loadSystem ============
client27.loadSystem = function (systemName, guild) {
    try {
        const systemPath = `./slashcommand27/${systemName}/index.js`;
        delete require.cache[require.resolve(systemPath)];
        const systemModule = require(systemPath);
        if (typeof systemModule === "function") systemModule(client27, guild);
    } catch (err) {
        console.log(`Error loading system ${systemName}:`, err.message);
    }
};



require('./dashboard/server')(client27);

// ============ تسجيل الدخول ============
client27.login(token);
module.exports = client27;

client27.once("ready", () => {
    client27.user.setPresence({
        activities: [{ name: "Developed by | 768a", type: 0 }],
        status: "online"
    });
    console.log(`✅ ${client27.user.tag} ready!`);
});