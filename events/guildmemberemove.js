const fs = require("fs");
const path = require("path");

const invitesPath = path.join(__dirname, "../Json-db/invites.json");

// دالة آمنة لقراءة ملف JSON بدون كاش
function loadInvites() {
    try {
        delete require.cache[require.resolve(invitesPath)];
        return require(invitesPath);
    } catch {
        return {};
    }
}

module.exports = {
    name: "guildMemberRemove",
    async execute(member) {

        // تحميل البيانات من Json-db
        let invitesData = loadInvites();

        // نبحث عن الشخص اللي جاب هذا العضو
        const inviterId = Object.keys(invitesData).find(id => {
            const data = invitesData[id];
            return Array.isArray(data.members) && data.members.includes(member.id);
        });

        if (!inviterId) return;

        // تأكيد وجود members كـ Array
        if (!Array.isArray(invitesData[inviterId].members)) {
            invitesData[inviterId].members = [];
        }

        // حذف العضو من قائمة اللي جابهم
        invitesData[inviterId].members =
            invitesData[inviterId].members.filter(m => m !== member.id);

        // تحديث الأرقام
        invitesData[inviterId].real = invitesData[inviterId].members.length;
        invitesData[inviterId].total =
            invitesData[inviterId].real + (invitesData[inviterId].fake || 0);

        // حفظ الملف
        fs.writeFileSync(invitesPath, JSON.stringify(invitesData, null, 2));
    }
};
