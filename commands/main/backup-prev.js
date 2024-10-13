const {
  EmbedBuilder,
  ChannelType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");
const serverDataDB = require("../../models/serverDataDB");
const backupsDataDB = require("../../models/backupsDataDB");
const backupDelete = require("./backup-delete");
module.exports = {
  name: "backup-prev",
  description: "Use this command to preview a server backup",
  options: [
    {
      name: "id",
      description: "Enter the backup ID",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: true,
    },
  ],
  userPermissions: [],
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const ID = interaction.options.getString("id");
    const backupsData = await backupsDataDB.findOne({
      Id: ID,
    });
    if (!backupsData)
      return interaction.reply({
        ephemeral: true,
        content: "Couldn't find a backup with this ID.",
      });
    if (backupsData.CreatorId !== interaction.user.id)
      return interaction.editReply({
        ephemeral: true,
        content: "This backup doesn't belong to you.",
      });

    const allData = backupsData;
    async function previewData(data, data2) {
      try {
        const channels = await interaction.guild.channels.fetch();

        if (channels.size === 0) return console.log("Server has no channels");

        const allChannelsData = data;
        const formattedData = await formatChannelsRoles(
          allChannelsData,
          data2,
          interaction
        );
        await interaction.editReply({
          embeds: [formattedData],
        });
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    }
    async function formatChannelsRoles(data, data2, interaction) {
      let channelResult = "";
      let roleResult = "";
      if (data.length !== 0)
        data.sort((a, b) => {
          const typeDiff =
            (a.type === ChannelType.GuildVoice ||
              a.type === ChannelType.GuildStageVoice) -
            (b.type === ChannelType.GuildVoice ||
              b.type === ChannelType.GuildStageVoice);

          return typeDiff === 0 ? a.position - b.position : typeDiff;
        });
      data2.sort((a, b) => {
        return b.position - a.position;
      });
      for (const object of data) {
        const name = object.name;
        const type = object.type;
        if (object.parentData) continue;

        if (type === ChannelType.GuildVoice) {
          channelResult += `> ${name}\n`;
        } else if (type === ChannelType.GuildText) {
          channelResult += `# ${name.replace(" ", "-")}\n`;
        } else if (type === ChannelType.GuildStageVoice) {
          channelResult += `) ${name}\n`;
        } else if (type === ChannelType.GuildForum) {
          channelResult += `] ${name.replace(" ", "-")}\n`;
        } else if (type === ChannelType.GuildAnnouncement) {
          channelResult += `! ${name}\n`;
        }
      }
      data.sort((a, b) => {
        const positionA = a.parentData
          ? a.parentData.position
          : Number.MAX_SAFE_INTEGER;
        const positionB = b.parentData
          ? b.parentData.position
          : Number.MAX_SAFE_INTEGER;
        return positionA - positionB;
      });
      for (const object of data) {
        if (object.parentData) {
          channelResult += `\n˅ ${object.parentData.name}:\n`;

          if (object.channels) {
            const sortedChannels = object.channels.sort((a, b) => {
              const typeDiff =
                (a.type === ChannelType.GuildVoice ||
                  a.type === ChannelType.GuildStageVoice) -
                (b.type === ChannelType.GuildVoice ||
                  b.type === ChannelType.GuildStageVoice);

              return typeDiff === 0 ? a.position - b.position : typeDiff;
            });

            for (const channel of sortedChannels) {
              if (channel.type === ChannelType.GuildVoice) {
                channelResult += ` > ${channel.name}\n`;
              } else if (channel.type === ChannelType.GuildText) {
                channelResult += ` # ${channel.name.replace(" ", "-")}\n`;
              } else if (channel.type === ChannelType.GuildStageVoice) {
                channelResult += ` ) ${channel.name}\n`;
              } else if (channel.type === ChannelType.GuildForum) {
                channelResult += ` ] ${channel.name.replace(" ", "-")}\n`;
              } else if (channel.type === ChannelType.GuildAnnouncement) {
                channelResult += ` ! ${channel.name}\n`;
              }
            }
          }
        }
      }
      if (data2.length === 0) roleResult = "No roles found.";
      for (const role of data2) {
        roleResult += `@${role.name}\n`;
      }

      // Truncate channel and role data if they exceed the limit
      const truncateData = (data, limit = 1000) => {
        if (data.length <= limit) return data;
        return data.substring(0, limit) + "...";
      };

      channelResult = truncateData(`\`\`\`${channelResult}\`\`\``);
      roleResult = truncateData(`\`\`\`${roleResult}\`\`\``);

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("Preview of the Backup")
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .addFields(
          {
            name: "Created By:",
            value: `<@${backupsData.CreatorId}>`,
            inline: true,
          },
          {
            name: "Created At:",
            value: `<t:${backupsData.CreatedAt}:R>`,
            inline: true,
          },
          {
            name: "Bans:",
            value: `\`${backupsData.Bans?.length ?? "0"}\``,
            inline: false,
          }
        );

      // Add channels and roles fields separately to handle potential length issues
      if (channelResult.length > 0) {
        embed.addFields({ name: "Channels:", value: channelResult });
      }
      if (roleResult.length > 0) {
        embed.addFields({ name: "Roles:", value: roleResult });
      }

      return embed;
    }
    await previewData(allData.ChannelsData, allData.RolesData);
  },
};
