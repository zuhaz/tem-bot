const {
  Events,
  PermissionFlagsBits,
  EmbedBuilder,
  Permissions,
  PermissionsBitField,
} = require("discord.js");
module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    const { commandName } = interaction;
    const { commands } = client;
    if (!interaction.isChatInputCommand()) return;
    const command = commands.get(commandName);

    if (!command) return;
    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.Administrator
      )
    )
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("Missing Permmission")
            .setDescription(
              "I don't have `ADMINISTRATOR` permission, and without that permission, the bot cannot function properly."
            ),
        ],
        ephemeral: true,
      });
    if (!interaction.member.permissions.has(command.userPermissions))
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("Missing Permmission")
            .setDescription(
              `You're missing the following permissions:\n${command.userPermissions
                .map((perm) => "- " + permissionValueToName(perm) + "\n")
                .join("")}`
            ),
        ],
        ephemeral: true,
      });
    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  },
};

function permissionValueToName(permissionValue) {
  for (const [name, value] of Object.entries(PermissionsBitField.Flags)) {
    if (value === permissionValue) {
      return name;
    }
  }
  return "Unknown Permission";
}
