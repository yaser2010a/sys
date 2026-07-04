const config = require("../config.js");

module.exports = async (interaction, command) => {

  // لو الأمر ما فيه صلاحيات → السماح للجميع
  if (!command.permissions) return true;

  const ownerId = config.owner;
  const isOwner = interaction.user.id === ownerId;

  const perms = command.permissions;

  // -----------------------------
  // 1) OWNER ONLY
  // -----------------------------
  if (perms.mode === "owner") {
    if (!isOwner) {
      await interaction.reply({
        content: "❌ هذا الأمر مخصص للأونر فقط",
        ephemeral: true
      });
      return false;
    }
    return true;
  }

  // -----------------------------
  // 2) ROLE ONLY (Owner + Role)
  // -----------------------------
  if (perms.mode === "role") {
    const roleId = perms.roleId;

    if (isOwner) return true;

    if (!interaction.member.roles.cache.has(roleId)) {
      await interaction.reply({
        content: `❌ هذا الأمر مخصص لرتبة <@&${roleId}> فقط`,
        ephemeral: true
      });
      return false;
    }

    return true;
  }

  // -----------------------------
  // 3) ROOM ONLY (Everyone + Room)
  // -----------------------------
  if (perms.mode === "room") {
    const roomId = perms.roomId;

    if (interaction.channel.id !== roomId) {
      await interaction.reply({
        content: `❌ هذا الأمر مسموح فقط في الروم <#${roomId}>`,
        ephemeral: true
      });
      return false;
    }

    return true;
  }

  // -----------------------------
  // 4) allowedRoles القديمة
  // -----------------------------
  const allowedRoles = perms.allowedRoles || [];

  if (allowedRoles.length === 0) {
    if (!isOwner) {
      await interaction.reply({
        content: "❌ هذا الأمر مخصص للأونر فقط",
        ephemeral: true
      });
      return false;
    }
    return true;
  }

  const hasRole = allowedRoles.some(roleId =>
    interaction.member.roles.cache.has(roleId)
  );

  if (!isOwner && !hasRole) {
    const rolesMention = allowedRoles.map(id => `<@&${id}>`).join(" , ");

    await interaction.reply({
      content: `❌ ما عندك الرتبة المطلوبة لاستخدام هذا الأمر: ${rolesMention}`,
      ephemeral: true
    });

    return false;
  }

  return true;
};