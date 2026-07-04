const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = '1523061475168616609';
const GUILD_ID = '1464582604391977106';

if (!TOKEN) {
    console.error('❌ لم يتم العثور على DISCORD_TOKEN في ملف .env');
    process.exit(1);
}

const commands = [];
const commandsPath = path.resolve(__dirname, 'slashcommand27');

function loadCommands(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(filePath)];
                const commandModule = require(filePath);
                const cmd = commandModule.data || (commandModule.default && commandModule.default.data);

                if (cmd && (cmd.name || typeof cmd === 'function')) {
                    const data = typeof cmd === 'function' ? cmd() : cmd;
                    const json = typeof data.toJSON === 'function' ? data.toJSON() : data;
                    commands.push(json);
                    console.log(`✅ تم تحميل: ${json.name || 'أمر بدون اسم'}`);
                } else {
                    console.warn(`⚠️ تم تجاهل ${file} — لا يحتوي على export باسم "data" صالح`);
                }
            } catch (error) {
                console.error(`❌ خطأ في تحميل الملف ${file}:`, error.message);
            }
        }
    }
}

async function main() {
    console.log('📂 جاري تحميل الأوامر من slashcommand27/ ...\n');
    loadCommands(commandsPath);

    console.log(`\n📦 إجمالي الأوامر المحمّلة محليًا: ${commands.length}`);

    if (commands.length === 0) {
        console.error('❌ لم يتم تحميل أي أمر — تأكد من أن ملفات الأوامر تصدّر { data: ... }');
        process.exit(1);
    }

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {
        console.log('\n🚀 جاري إرسال الأوامر إلى Discord (Guild — تظهر فورًا)...');

        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );

        console.log(`\n✅ تم تسجيل ${data.length} أمر بنجاح على السيرفر (Guild: ${GUILD_ID})`);
        console.log('ℹ️ الأوامر Guild تظهر فورًا. لو تحتاج نشرها على كل السيرفرات (Global) قولي وأعدّل السكريبت.');
    } catch (error) {
        console.error('\n❌ فشل تسجيل الأوامر:');
        console.error(error);

        if (error.code === 50001) {
            console.error('👉 السبب المحتمل: البوت غير موجود في السيرفر ده، أو الـ CLIENT_ID غلط.');
        } else if (error.status === 401) {
            console.error('👉 السبب المحتمل: التوكن (DISCORD_TOKEN) غير صحيح أو منتهي.');
        } else if (error.status === 429) {
            console.error('👉 تم الوصول لحد الـ Rate Limit من كثرة الديبلوي. انتظر شوية وحاول تاني.');
        }
        process.exit(1);
    }
}

main();