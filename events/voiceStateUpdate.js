const { EmbedBuilder } = require('discord.js');
const { startVoiceSession, endVoiceSession } = require('../utils/leveling');
const { sendLogVoice } = require('../utils/logger');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const member = newState.member ?? oldState.member;
    const guild = newState.guild;

    if (!oldState.channelId && newState.channelId) {
      startVoiceSession(guild.id, member.id);
      sendLogVoice(guild, `🔊 <@${member.id}> دخل الروم الصوتي <#${newState.channelId}>`);
    } else if (oldState.channelId && !newState.channelId) {
      await endVoiceSession(guild, member.id);
      sendLogVoice(guild, `🔇 <@${member.id}> خرج من الروم الصوتي <#${oldState.channelId}>`);
    } else if (oldState.channelId !== newState.channelId) {
      sendLogVoice(guild, `🔀 <@${member.id}> انتقل من <#${oldState.channelId}> إلى <#${newState.channelId}>`);
    }
  },
};
