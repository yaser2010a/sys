const fs = require("fs");
const path = require("path");

const invitesPath = path.join(__dirname, "../../Json-db/invites.json");
let invitesData = require("../Json-db/invites.json");

const invitesCache = new Map();

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    const guild = member.guild;

    const newInvites = await guild.invites.fetch();
    const oldInvites = invitesCache.get(guild.id) || new Map();

    const usedInvite = newInvites.find(inv => oldInvites.get(inv.code) < inv.uses);

    invitesCache.set(guild.id, new Map(newInvites.map(inv => [inv.code, inv.uses])));

    if (!usedInvite) return;

    const inviter = usedInvite.inviter;
    if (!inviter) return;

    if (!invitesData[inviter.id]) {
      invitesData[inviter.id] = { real: 0, fake: 0, total: 0 };
    }

    const accountAge = Date.now() - member.user.createdTimestamp;
    const oneMonth = 1000 * 60 * 60 * 24 * 30;

    if (accountAge < oneMonth) {
      invitesData[inviter.id].fake++;
    } else {
      invitesData[inviter.id].real++;
    }

    invitesData[inviter.id].total = invitesData[inviter.id].real + invitesData[inviter.id].fake;

    fs.writeFileSync(invitesPath, JSON.stringify(invitesData, null, 2));
  }
};
