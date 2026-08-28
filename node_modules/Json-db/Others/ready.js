const invitesCache = new Map();

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    client.guilds.cache.forEach(async guild => {
      const invites = await guild.invites.fetch();
      invitesCache.set(guild.id, new Map(invites.map(inv => [inv.code, inv.uses])));
    });

    console.log("Invites cache loaded.");
  }
};
