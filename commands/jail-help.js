const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('jail-help').setDescription('عرض كل أوامر نظام السجن'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🔒 أوامر نظام السجن')
      .setColor('#992D22')
      .addFields(
        { name: '/سجن', value: 'سجن عضو (يفقد رتبه ويحصل رتبة السجين)' },
        { name: '/فك_السجن', value: 'فك السجن وإرجاع الرتب السابقة' },
        { name: '/عفو', value: 'إخراج العضو من السجن بدون إرجاع رتبه' },
        { name: '/سجن_رتبة', value: 'تحديد رتبة وقناة السجن (أدمن فقط)' },
        { name: '/سجن_نظام', value: 'تفعيل/تعطيل النظام وخيار إخفاء الرومات (أدمن فقط)' },
        { name: '/سجن_تحديث_الاخفاء', value: 'إعادة مزامنة إخفاء الرومات على كل القنوات (أدمن فقط)' },
        { name: '/سجن_رتب_السجانين', value: 'تحديد مين يقدر يستخدم أوامر السجن غير الأدمن' }
      )
      .setFooter({ text: 'كل هذي الإعدادات متوفرة أيضاً بالداشبورد' });

    await interaction.reply({ embeds: [embed] });
  },
};
