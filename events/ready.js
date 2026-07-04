const { Client27, ActivityType, Events } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    /**
     * @param {Client27} client27
     */
    execute(client27) {
        client27.user.setStatus("online");
        client27.user.setActivity({
            name: 'developed by|768a', 
            type: ActivityType.Streaming, 
        });
        
           console.log(` 

███████╗ ██████╗  █████╗  █████╗ 
╚════██║██╔════╝ ██╔══██╗██╔══██╗
    ██╔╝███████╗ ╚█████╔╝███████║
   ██╔╝ ██╔═══██╗██╔══██╗██╔══██║
   ██║  ╚██████╔╝╚█████╔╝██║  ██║
   ╚═╝   ╚═════╝  ╚════╝ ╚═╝  ╚═╝
                                



         ⚡ System bot Powered by 768a ⚡

  `);
    },
};
