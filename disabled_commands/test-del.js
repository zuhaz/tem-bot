const { EmbedBuilder ,PermissionFlagsBits} = require("discord.js");
module.exports = {
  name: "test-del",
  description:
    "Use this command to nuke your entire server (Roles excluded for some reasons)",
  userPermissions: [PermissionFlagsBits.Administrator],
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: false });

    interaction.guild.channels.fetch().then((channel) => {
      channel.forEach((channel) => {
        channel.delete().catch(() => {
          return;
        });
      });
    });
    await console.log("Nuked the channels.");
  },
};
