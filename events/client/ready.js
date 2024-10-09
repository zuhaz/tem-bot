const { Events, ActivityType } = require("discord.js");
const { commandHandler } = require("../../commandHandler");

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    commandHandler(client)
      .then(() => {
        console.log("Loaded And Registered All Commands.");
      })
      .catch((err) => {
        console.log(`Couldn't load and register commands\n${err}`);
      });
    client.user.setActivity({
      name: "Backup Commands",
      type: ActivityType.Watching,
    });
  },
};
