const { REST, Routes } = require('discord.js');
require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = '1523061475168616609';
const GUILD_ID = '1464582604391977106';

if (!TOKEN) {
    console.error('❌ لم يتم العثور على DISCORD_TOKEN في ملف .env');
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

async function main() {
    try {
        console.log('🧹 جاري حذف جميع أوامر السيرفر (Guild)...');
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: [] }
        );
        console.log(`✅ تم حذف جميع أوامر السيرفر (Guild: ${GUILD_ID}) بنجاح`);

        // إذا كنت قد سجّلت أوامر Global سابقًا (تظهر بكل السيرفرات)، فك التعليق عن السطور التالية لحذفها أيضًا:
        // console.log('🧹 جاري حذف جميع الأوامر العالمية (Global)...');
        // await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
        // console.log('✅ تم حذف جميع الأوامر العالمية بنجاح');

    } catch (error) {
        console.error('❌ فشل حذف الأوامر:');
        console.error(error);

        if (error.code === 50001) {
            console.error('👉 السبب المحتمل: البوت غير موجود في السيرفر ده، أو الـ CLIENT_ID غلط.');
        } else if (error.status === 401) {
            console.error('👉 السبب المحتمل: التوكن (DISCORD_TOKEN) غير صحيح أو منتهي.');
        }
        process.exit(1);
    }
}

main();