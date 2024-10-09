const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "latency",
  description: "Use this command to check bot's latency.",
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: false });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor("#2f3136")
          .setTitle("📶 | Latency Command")
          .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .addFields(
            {
              name: "Client Latency:",
              value: `${Date.now() - interaction.createdTimestamp}ms`,
              inline: true,
            },
            {
              name: "API Latency:",
              value: `${Math.round(client.ws.ping)}ms`,
              inline: true,
            }
          )
          .setFooter({ text: `Tem | Copyright 2023-2033` }),
      ],
    });
  },
};
