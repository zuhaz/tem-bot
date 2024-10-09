const {
  ChannelType,
  EmbedBuilder,
  ApplicationCommandOptionType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const serverDataDB = require("../../models/serverDataDB");
const backupsDataDB = require("../../models/backupsDataDB");
module.exports = {
  name: "backup-load",
  description: "Use this command to reset the server.",
  options: [
    {
      name: "id",
      description: "Enter the backup ID",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  userPermissions: [PermissionFlagsBits.Administrator],
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    let ID = interaction.options.getString("id");
    const backupsData = await backupsDataDB.findOne({
      Id: ID,
    });
    if (!backupsData)
      return interaction.editReply({
        ephemeral: true,
        content: "Couldn't find any backups.",
      });
    if (backupsData.CreatorId !== interaction.user.id)
      return interaction.editReply({
        ephemeral: true,
        content: "This backup doesn't belong to you.",
      });
    const allData = backupsData;
    const globalSuccessRateEmbed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("Loading up...")
      .setDescription("Loading up the backup...");
    let successStates = [];
    let backupLoadingState = true;
    const backupStates = {};

    // Flushing the server before loading up.
    await flushServer(interaction);

    await createRolesFromData(interaction, allData.RolesData);
    await createChannelsFromData(interaction, allData.ChannelsData);

    // Loading all bans

    await createBans(interaction, allData.Bans);

    if (backupLoadingState === true) {
      await showSuccessRate(
        interaction,
        globalSuccessRateEmbed.setDescription(
          `Successfully loaded the backup with the id ${ID}`
        )
      );
      // await interaction.channel.send({
      //   content: "Deleting this channel...",
      // });
      // await interaction.channel.delete().catch((err) => {
      //   return;
      // });
      return;
    }

    async function createChannelsFromData(interaction, data) {
      try {
        await showSuccessRate(
          interaction,
          globalSuccessRateEmbed.setDescription(
            "Loading up the channels & roles..."
          )
        );
        if (backupLoadingState !== true) return;
        for (const item of data) {
          if (item.parentData) {
            const parent = await interaction.guild.channels.create({
              name: item.parentData.name,
              type: ChannelType.GuildCategory,
              position: item.parentData.position,
              permissionOverwrites: Object.keys(
                item.parentData.permissionOverwrites
              ).map((key) => {
                const permissionOverwrite =
                  item.parentData.permissionOverwrites[key];
                return {
                  id: permissionOverwrite.id,
                  type: permissionOverwrite.type,
                  allow: permissionOverwrite.allow.bitfield.toString(), // Convert to string
                  deny: permissionOverwrite.deny.bitfield.toString(), // Convert to string
                };
              }),
            });

            for (const channel of item.channels) {
              const permissionOverwrites = Object.keys(
                channel.permissionOverwrites
              ).map((key) => {
                const permissionOverwrite = channel.permissionOverwrites[key];
                return {
                  id: permissionOverwrite.id,
                  type: permissionOverwrite.type,
                  allow: permissionOverwrite.allow.bitfield.toString(), // Convert to string
                  deny: permissionOverwrite.deny.bitfield.toString(), // Convert to string
                };
              });
              if (channel.type === ChannelType.GuildVoice) {
                await interaction.guild.channels.create({
                  name: channel.name,
                  type: channel.type,
                  parent: parent,
                  position: channel.position,
                  bitrate: channel.bitrate,
                  userLimit: channel.userLimit,
                  rtcRegion: channel.rtcRegion,
                  videoQualityMode: channel.videoQualityMode,
                  permissionOverwrites: permissionOverwrites,
                });
              } else if (channel.type === ChannelType.GuildText) {
                await interaction.guild.channels.create({
                  name: channel.name,
                  type: channel.type,
                  parent: parent,
                  position: channel.position,
                  nsfw: channel.isNsfw,
                  topic: channel.topic,
                  rateLimitPerUser: channel.rateLimitPerUser,
                  permissionOverwrites: permissionOverwrites,
                });
                // .then(async (ch) => {
                //   const messages = await checkMessages(
                //     channel.channelid,
                //     allData.ChannelsMessages
                //   );
                //   if (messages === false) return;
                //   await sendMessagesThroughWebhook(ch, messages);
                // });
              } else if (channel.type === ChannelType.GuildForum) {
                await interaction.guild.channels.create({
                  name: channel.name,
                  type: channel.type,
                  parent: parent,
                  position: channel.position,
                  topic: channel.topic,
                  lastMessageId: channel.lastMessageId,
                  nsfw: channel.nsfw,
                  rateLimitPerUser: channel.rateLimitPerUser,
                  availableTags: channel.availableTags,
                  defaultReactionEmoji: channel.defaultReactionEmoji,
                  defaultThreadRateLimitPerUser:
                    channel.defaultThreadRateLimitPerUser,
                  defaultAutoArchiveDuration:
                    channel.defaultAutoArchiveDuration,
                  permissionOverwrites: permissionOverwrites,
                });
              } else if (channel.type === ChannelType.GuildAnnouncement) {
                await interaction.guild.channels.create({
                  name: channel.name,
                  type: channel.type,
                  parent: parent,
                  position: channel.position,
                  topic: channel.topic,
                  lastMessageId: channel.lastMessageId,
                  nsfw: channel.nsfw,
                  rateLimitPerUser: channel.rateLimitPerUser,
                  permissionOverwrites: permissionOverwrites,
                });
              } else if (channel.type == ChannelType.GuildStageVoice) {
                await interaction.guild.channels.create({
                  name: channel.name,
                  type: ChannelType.GuildStageVoice,
                  parent: parent,
                  position: channel.position,
                  bitrate: channel.bitrate,
                  videoQualityMode: channel.videoQualityMode,
                  userLimit: 0,
                  rtcRegion: channel.rtcRegion,
                  topic: channel.topic,
                  rateLimitPerUser: channel.rateLimitPerUser,
                  permissionOverwrites: permissionOverwrites,
                });
              }
            }
          } else {
            if (item.parent) continue;
            const permissionOverwrites = Object.keys(
              item.permissionOverwrites
            ).map((key) => {
              const permissionOverwrite = item.permissionOverwrites[key];
              return {
                id: permissionOverwrite.id,
                type: permissionOverwrite.type,
                allow: permissionOverwrite.allow.bitfield.toString(), // Convert to string
                deny: permissionOverwrite.deny.bitfield.toString(), // Convert to string
              };
            });
            if (item.type === ChannelType.GuildVoice) {
              await interaction.guild.channels.create({
                name: item.name,
                type: item.type,
                position: item.position,
                bitrate: item.bitrate,
                userLimit: item.userLimit,
                rtcRegion: item.rtcRegion,
                videoQualityMode: item.videoQualityMode,
                permissionOverwrites: permissionOverwrites,
              });
            } else if (item.type === ChannelType.GuildText) {
              await interaction.guild.channels.create({
                name: item.name,
                type: item.type,
                position: item.position,
                nsfw: item.isNsfw,
                topic: item.topic,
                rateLimitPerUser: item.rateLimitPerUser,
                permissionOverwrites: permissionOverwrites,
              });
              // .then(async (ch) => {
              //   const messages = await checkMessages(
              //     item.channelid,
              //     allData.ChannelsMessages
              //   );
              //   if (messages === false) return;
              //   await sendMessagesThroughWebhook(ch, messages);
              // });
            } else if (item.type === ChannelType.GuildForum) {
              await interaction.guild.channels.create({
                name: item.name,
                type: item.type,
                position: item.position,
                topic: item.topic,
                lastMessageId: item.lastMessageId,
                nsfw: item.nsfw,
                rateLimitPerUser: item.rateLimitPerUser,
                availableTags: item.availableTags,
                defaultReactionEmoji: item.defaultReactionEmoji,
                defaultThreadRateLimitPerUser:
                  item.defaultThreadRateLimitPerUser,
                defaultAutoArchiveDuration: item.defaultAutoArchiveDuration,
                permissionOverwrites: permissionOverwrites,
              });
            } else if (item.type === ChannelType.GuildAnnouncement) {
              await interaction.guild.channels.create({
                name: item.name,
                type: item.type,
                position: item.position,
                topic: item.topic,
                lastMessageId: item.lastMessageId,
                nsfw: item.nsfw,
                rateLimitPerUser: item.rateLimitPerUser,
                permissionOverwrites: permissionOverwrites,
              });
            } else if (item.type == ChannelType.GuildStageVoice) {
              await interaction.guild.channels.create({
                name: item.name,
                type: item.type,
                position: item.position,
                bitrate: item.bitrate,
                userLimit: 0,
                rtcRegion: item.rtcRegion,
                topic: item.topic,
                permissionOverwrites: permissionOverwrites,
              });
            }
          }
        }
      } catch (error) {
        await showSuccessRate(
          interaction,
          globalSuccessRateEmbed.setDescription("Error in creating channels...")
        );
        console.error("Error creating channels:", error);
      }
    }
    async function createRolesFromData(interaction, data) {
      if (backupLoadingState !== true) return;
      for (const role of data) {
        await interaction.guild.roles
          .create({
            name: role.name,
            color: role.color,
            hoist: role.hoist,
            permissions: role?.permissions,
            position: role.position,
            mentionable: role.mentionable,
            icon: role.icon,
            unicodeEmoji: role.unicodeEmoji,
          })
          .catch(() => {
            return;
          });
      }
    }
    async function flushServer(interaction) {
      if (backupLoadingState !== true) return;

      try {
        await showSuccessRate(
          interaction,
          globalSuccessRateEmbed.setDescription("Flushing the roles...")
        );
        await interaction.guild.roles.cache.each(async (role) => {
          if (role.editable && role.name !== "@everyone") {
            await role.delete().catch((err) => {
              return;
            });
          }
        });
        await showSuccessRate(
          interaction,
          globalSuccessRateEmbed.setDescription("Flushing the channels...")
        );
        await interaction.guild.channels.fetch().then((channels) => {
          channels.forEach(async (channel) => {
            if (channel.id === interaction.channel.id) return;
            await channel.delete().catch((err) => {
              return;
            });
          });
        });
      } catch (err) {
        showSuccessRate(
          interaction,
          globalSuccessRateEmbed
            .setDescription("Couldn't load the backup properly...")
            .setTitle("Error in loading the backup...")
        );
      }
    }
    async function createBans(interaction, data) {
      if (backupLoadingState !== true) return;

      if (data !== null) {
        for (const bannedUser of data) {
          await showSuccessRate(
            interaction,
            globalSuccessRateEmbed.setDescription("Loading up the bans...")
          );
          await interaction.guild.bans.create(bannedUser);
        }
      }
    }
    async function showSuccessRate(interaction, embed) {
      await interaction.editReply({
        embeds: [embed],
      });
    }
    async function sendMessagesThroughWebhook(channel, data) {
      if (data === null) return;
      for (const message of data.channelMessages) {
        if (message.content === undefined) return;
        await channel
          .createWebhook({
            name: channel.name,
            avatar: message.author.avatar,
          })
          .then(async (webhook) => {
            await webhook.edit({
              name: message.author.username,
              avatar: message.author.avatar,
            });
            if (message.content === "") {
              await webhook.send({
                embeds: message.embeds ?? [],
                files: message.files ?? [],
                components: message.components ?? [],
                attachments: message.attachments ?? [],
              });
            } else {
              await webhook.send({
                content: message.content,
                embeds: message.embeds.data ?? [],
                files: message.files ?? [],
                components: message.components.components ?? [],
                attachments: message.attachments ?? [],
              });
            }
            await webhook.delete().catch(() => {
              return;
            });
          });
      }
    }

    async function checkMessages(channelID, data) {
      const foundMessage = data.find(
        (element) => element.channelID === channelID
      );

      if (foundMessage) {
        return foundMessage;
      } else {
        return null; // or any other value that indicates no match
      }
    }
  },
};
