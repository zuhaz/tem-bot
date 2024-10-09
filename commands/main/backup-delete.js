const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");
const backupsDataDB = require("../../models/backupsDataDB");
module.exports = {
  name: "backup-delete",
  description: "Use this command to delete any backup that you created.",
  options: [
    {
      name: "id",
      description: "Enter the backup ID",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: true,
    },
  ],
  userPermissions: [PermissionFlagsBits.Administrator],
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const ID = interaction.options.getString("id");
    const backupsData = await backupsDataDB.findOne({
      Id: ID,
    });
    let embedColor = "#2b2d31";
    const globalSuccessRateEmbed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle("Deleted the backup");
    if (!backupsData)
      return interaction.editReply({ content: "Couldn't find any backups." });
    if (backupsData.CreatorId !== interaction.user.id)
      return interaction.editReply({
        content: "This backup doesnt belong to you.",
        ephemeral: true,
      });
    await backupsDataDB.findOneAndRemove({ Id: ID });
    interaction.editReply({
      embeds: [
        globalSuccessRateEmbed.setDescription(
          `Successfully deleted the backup with the id of ${ID}`
        ),
      ],
      ephemeral: true,
    });
  },
};
