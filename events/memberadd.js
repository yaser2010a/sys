const { Database } = require("st.db");

// قواعد البيانات
const rolesDB = new Database("/Json-db/Bots/restoreRoles.json");
const timeoutDB = new Database("/Json-db/Bots/timeoutDB.json");

// ملف الرتب المسموح استرجاعها
const rolesFile = require("../roles.json");

module.exports = {
    name: "guildMemberAdd",

    async execute(member) {

        // ------------------------------------
        // 1) استرجاع الرتب المحفوظة
        // ------------------------------------
        const savedRoles = rolesDB.get(`restore_${member.id}_${member.guild.id}`);

        if (savedRoles && savedRoles.length > 0) {

            const allowedRoles = rolesFile.restorableRoles;

            savedRoles.forEach(roleId => {
                if (allowedRoles.includes(roleId)) {
                    member.roles.add(roleId).catch(() => {});
                }
            });

            rolesDB.delete(`restore_${member.id}_${member.guild.id}`);
        }

        // ------------------------------------
        // 2) استرجاع التايم أوت (إن وجد)
        // ------------------------------------
        const timeoutData = timeoutDB.get(`timeout_${member.id}_${member.guild.id}`);

        if (timeoutData) {
            const { remaining, reason } = timeoutData;

            await member.timeout(remaining, reason).catch(() => {});

            timeoutDB.delete(`timeout_${member.id}_${member.guild.id}`);
        }
    }
};
