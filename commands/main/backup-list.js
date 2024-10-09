const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  PermissionFlagsBits,
} = require("discord.js");
const serverDataDB = require("../../models/serverDataDB");
const backupsDataDB = require("../../models/backupsDataDB");

module.exports = {
  name: "backup-list",
  description: "Use this command to check the backups you created.",
  userPermissions: [],
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const backupsData = await backupsDataDB.find({
      CreatorId: interaction.user.id,
    });

    if (!backupsData || backupsData.length === 0) {
      return interaction.editReply({
        ephemeral: true,
        content: "Couldn't find any backups belonging to you.",
      });
    }

    const fieldsPerPage = 12;
    const pages = Math.ceil(backupsData.length / fieldsPerPage);
    // console.log(backupsData.length / fieldsPerPage);
    let currentPage = 0;

    const previousButton = {
      label: "Previous",
      style: ButtonStyle.Primary,
      customId: "previous_button",
    };
    const nextButton = {
      label: "Next",
      style: ButtonStyle.Primary,
      customId: "next_button",
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder(previousButton),
      new ButtonBuilder(nextButton)
    );

    const filter = (i) => {
      i.deferUpdate();
      return i.customId === "previous_button" || i.customId === "next_button";
    };

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
      componentType: ComponentType.Button,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "previous_button") {
        currentPage = (currentPage - 1 + pages) % pages;
      } else if (i.customId === "next_button") {
        currentPage = (currentPage + 1) % pages;
      }

      await updateEmbed();
    });

    collector.on("end", () => {
      row.components.forEach((component) => component.setDisabled(true));
      interaction.editReply({ components: [row] });
    });

    const updateEmbed = async () => {
      row.components[0].setDisabled(currentPage === 0);
      row.components[1].setDisabled(currentPage === pages - 1);
      const start = currentPage * fieldsPerPage;
      const end = start + fieldsPerPage;
      const currentFields = backupsData.slice(start, end).map((backup) => ({
        name: `${backup.Id}`,
        value: `Created by <@${backup.CreatorId}> <t:${backup.CreatedAt}:R>`,
      }));
      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("List of the Backups")
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .addFields(currentFields)
        .setFooter({ text: `Page ${currentPage + 1}/${pages}` });

      await interaction.editReply({
        embeds: [embed],
        components: pages > 1 ? [row] : [],
      });
    };

    await updateEmbed();
  },
};
