const { EmbedBuilder } = require('discord.js');
const { getGuildSettings } = require('./database');

async function sendLog(guild, type, embed) {
  const settings = getGuildSettings(guild.id);
  const map = {
    message: settings.log_message,
    reaction: settings.log_reaction,
    member: settings.log_member,
    voice: settings.log_voice,
    ban: settings.log_ban,
    kick: settings.log_kick,
    unban: settings.log_unban,
    mute: settings.log_mute,
    unmute: settings.log_unmute,
    warn: settings.log_warn,
    jail: settings.log_jail,
  };
  const channelId = map[type];
  if (!channelId) return;

  const channel = await guild.channels.fetch(channelId).catch(() => null);
  if (!channel) return;

  channel.send({ embeds: [embed] }).catch(() => {});
}

function logMessageDelete(message) {
  if (!message.guild || message.author?.bot) return;
  const embed = new EmbedBuilder()
    .setTitle('🗑️ رسالة محذوفة')
    .setColor('#ED4245')
    .addFields(
      { name: 'العضو', value: `<@${message.author?.id ?? 'غير معروف'}>` },
      { name: 'القناة', value: `<#${message.channel.id}>` },
      { name: 'المحتوى', value: message.content?.slice(0, 1000) || '*بدون نص (وسائط فقط)*' }
    )
    .setTimestamp();
  sendLog(message.guild, 'message', embed);
}

function logMessageEdit(oldMessage, newMessage) {
  if (!newMessage.guild || newMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;
  const embed = new EmbedBuilder()
    .setTitle('✏️ رسالة معدّلة')
    .setColor('#FEE75C')
    .addFields(
      { name: 'العضو', value: `<@${newMessage.author.id}>` },
      { name: 'القناة', value: `<#${newMessage.channel.id}>` },
      { name: 'قبل', value: oldMessage.content?.slice(0, 500) || '*فارغ*' },
      { name: 'بعد', value: newMessage.content?.slice(0, 500) || '*فارغ*' }
    )
    .setTimestamp();
  sendLog(newMessage.guild, 'message', embed);
}

function logReactionRemove(reaction, user) {
  if (!reaction.message.guild || user.bot) return;
  const embed = new EmbedBuilder()
    .setTitle('💢 رياكت محذوف')
    .setColor('#ED4245')
    .addFields(
      { name: 'العضو', value: `<@${user.id}>` },
      { name: 'الإيموجي', value: `${reaction.emoji}` },
      { name: 'الرسالة', value: `[اذهب للرسالة](${reaction.message.url})` }
    )
    .setTimestamp();
  sendLog(reaction.message.guild, 'reaction', embed);
}

const ACTION_ICONS = {
  ban: '🚫', kick: '👢', unban: '✅', mute: '🔇', unmute: '🔊', warn: '⚠️', jail: '🔒',
};

/**
 * type: ban | kick | unban | mute | unmute | warn | jail (يحدد القناة اللي ترسل لها اللوق)
 * action: النص المعروض بعنوان اللوق (مثال: "حظر", "فك سجن")
 */
function logModAction(guild, { type, action, target, moderator, reason }) {
  const embed = new EmbedBuilder()
    .setTitle(`${ACTION_ICONS[type] || '🔨'} ${action}`)
    .setColor('#ED4245')
    .addFields(
      { name: 'العضو', value: `${target}` },
      { name: 'بواسطة', value: `${moderator}` },
      { name: 'السبب', value: reason || 'بدون سبب' }
    )
    .setTimestamp();
  sendLog(guild, type, embed);
}

function logMember(guild, description, color = '#57F287') {
  const embed = new EmbedBuilder().setDescription(description).setColor(color).setTimestamp();
  sendLog(guild, 'member', embed);
}

function sendLogVoice(guild, description) {
  const embed = new EmbedBuilder().setDescription(description).setColor('#5865F2').setTimestamp();
  sendLog(guild, 'voice', embed);
}

module.exports = { logMessageDelete, logMessageEdit, logReactionRemove, logModAction, logMember, sendLogVoice };
