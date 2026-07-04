const { Database } = require("st.db");
const rolesDB = new Database("/Json-db/Bots/restoreRoles.json");
const timeoutDB = new Database("/Json-db/Bots/timeoutDB.json");
const rolesFile = require("../roles.json");

module.exports = {
    name: "guildMemberRemove",

    async execute(member) {

        // -----------------------------
        // 1) حفظ الرتب المسموح استرجاعها
        // -----------------------------
        const allowedRoles = rolesFile.restorableRoles;

        const rolesToSave = member.roles.cache
            .filter(role => allowedRoles.includes(role.id))
            .map(role => role.id);

        await rolesDB.set(`restore_${member.id}_${member.guild.id}`, rolesToSave);

        // -----------------------------
        // 2) حفظ الوقت المتبقي من التايم اوت
        // -----------------------------
        const timeout = member.communicationDisabledUntilTimestamp;

        if (timeout) {
            const now = Date.now();
            const remaining = timeout - now;

            if (remaining > 0) {
                await timeoutDB.set(`timeout_${member.id}_${member.guild.id}`, {
                    remaining,
                    reason: "Timeout Restore"
                });
            }
        }
    }
};
