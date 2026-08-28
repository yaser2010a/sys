require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commandsData = [];

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    // إضافة فحص للتأكد من وجود خاصية data
    if ('data' in command && 'execute' in command) {
        commandsData.push(command.data.toJSON());
    } else {
        console.warn(`[تحذير] الملف ${file} مفقود فيه خاصية "data" أو "execute".`);
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`بدء تسجيل ${commandsData.length} أمر...`);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commandsData });
    console.log(`تم تسجيل ${commandsData.length} أمر بنجاح.`);
  } catch (err) {
    console.error('فشل تسجيل الأوامر:', err);
  }
})();