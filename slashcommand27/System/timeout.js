const { 
    PermissionsBitField, 
    SlashCommandBuilder 
} = require("discord.js");

// محول الوقت فقط
function parseDuration(str) {
    const match = str.match(/(\d+)(s|m|h|d|w|mo|y)/i);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers = {
        s: 1000,
        m: 1000 * 60,
        h: 1000 * 60 * 60,
        d: 1000 * 60 * 60 * 24,
        w: 1000 * 60 * 60 * 24 * 7,
        mo: 1000 * 60 * 60 * 24 * 30,
        y: 1000 * 60 * 60 * 24 * 365
    };

    return value * multipliers[unit];
}

module.exports = {

    permissions: {
        mode: "role",          
        roleId: "1464623559874973729"
    },

    adminsOnly: false,

    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('اعطاء تايم اوت لشخص')
        .addUserOption(option =>
            option
                .setName('member')
                .setDescription('الشخص')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('time')
                .setDescription('المدة مثل: 10m / 2h / 3d / 1mo / 1y')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('السبب')
                .setRequired(false)
        ),

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({
                content: `❌ **لا تمتلك صلاحية لفعل ذلك**`,
                ephemeral: true
            });
        }

        const member = interaction.options.getMember('member');
        const timeInput = interaction.options.getString('time');
        const reason = interaction.options.getString('reason') ?? "No reason";

        if (!member) {
            return interaction.reply({
                content: `❌ **لم أجد هذا العضو داخل السيرفر**`,
                ephemeral: true
            });
        }

        // تحويل الوقت
        const duration = parseDuration(timeInput);
        if (!duration) {
            return interaction.reply({
                content: `❌ **صيغة الوقت غير صحيحة**  
استخدم:  
\`10s\` — ثواني  
\`5m\` — دقائق  
\`2h\` — ساعات  
\`3d\` — أيام  
\`1w\` — أسابيع  
\`1mo\` — شهر  
\`1y\` — سنة`,
                ephemeral: true
            });
        }

        // تنفيذ التايم اوت
        await member.timeout(duration, reason).catch(() => {
            return interaction.reply({
                content: `❌ **الرجاء التحقق من صلاحياتي ثم اعادة المحاولة**`,
                ephemeral: true
            });
        });

        return interaction.reply({
            content: `⏳ **تم اعطاء التايم اوت لـ ${member.user.tag} لمدة \`${timeInput}\`**`
        });
    }
};
