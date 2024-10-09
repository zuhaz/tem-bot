const {
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const serverDataDB = require("../../models/serverDataDB");
const backupsDataDB = require("../../models/backupsDataDB");
module.exports = {
  name: "backup-create",
  description: "Use this command to make a backup of your server.",
  userPermissions: [PermissionFlagsBits.Administrator],
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const backupsData = await backupsDataDB.find({
      CreatorId: interaction.user.id,
    });
    let createdAt = Math.floor(Date.now() / 1000);
    let backupID = generateRandomId().toString();
    let embedColor = "#2b2d31";
    let currentBackupCount = backupsData.length;
    let backupLimit = 25;
    console.log(backupsData.length);
    if (
      currentBackupCount >= 25 &&
      interaction.user.id !== "564103070334844960"
    )
      return interaction.editReply({
        content: `You have reached your backup limit which is of ${backupLimit}`,
      });
    const globalSuccessRateEmbed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle("Creating backup")
      .setDescription("Starting initial steps...");
    await interaction.editReply({ embeds: [globalSuccessRateEmbed] });
    const allChannelsData = [];
    const allRoles = [];
    const allChannelsMessages = [];
    const communityChannels = [];
    let completeBanIdList;

    await saveChannelsAndCategories();
    // await saveChannelMessages();
    await backupsDataDB.insertMany({
      Id: backupID,
      BackupName: interaction.guild.name,
      CreatorId: interaction.user.id,
      CreatedAt: createdAt.toString(),
      ChannelsData: allChannelsData,
      ChannelsMessages: allChannelsMessages,
      RolesData: allRoles,
      Bans: completeBanIdList,
    });
    await interaction.editReply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor(embedColor)
          .setTitle("Backup Created")
          .setDescription(`Created a backup with id \`${backupID}\``)
          .addFields(
            {
              name: "To Preview:",
              value: `\`\`\`/backup-prev id: ${backupID}   \`\`\``,
            },
            {
              name: "To Load:",
              value: `\`\`\`/backup-load id: ${backupID}   \`\`\``,
            }
          ),
      ],
    });
    async function saveChannelMessages() {
      const channels = await interaction.guild.channels.fetch();
      let messages = [];
      let totalMessages = await getTotalMessages(interaction);
      await editMessage(
        interaction,
        globalSuccessRateEmbed
          .setDescription("Saving server channels messages...")
          .addFields({
            name: "Total messages",
            value: `\`${totalMessages}\``,
            inline: true,
          })
      );
      for (const channel of channels.values()) {
        if (
          channel.type === ChannelType.GuildCategory ||
          channel.type === ChannelType.GuildVoice ||
          channel.type === ChannelType.GuildStageVoice
        ) {
          continue;
        }
        async function fetchMessagesBefore(message) {
          if (!message) return;
          const messagePage = await channel.messages.fetch({
            limit: 100,
            before: message.id,
          });

          if (messagePage.size > 0) {
            const messagesArray = messagePage.values();
            for (const msg of messagesArray) {
              messages.push({
                content: msg.content,
                type: msg.type,
                createdTimestamp: msg.createdTimestamp,
                system: msg.system,
                author: {
                  id: msg.author.id,
                  bot: msg.author.bot,
                  username: msg.author.username,
                  globalName: msg.author.globalName,
                  discriminator: msg.author.discriminator,
                  avatar: msg.author.displayAvatarURL({ dynamic: true }),
                  banner: msg.author.bannar,
                  verified: msg.author.verified,
                  mfaEnabled: msg.author.mfaEnabled,
                },
                pinned: msg.pinned,
                tts: msg.tts,
                nonce: msg.nonce,
                embeds: msg.embeds,
                components: msg.components,
                attachments: msg.attachments,
                stickers: msg.stickers,
                position: msg.position,
                reactions: msg.reactions,
              });
            }
            await fetchMessagesBefore(messagesArray[0]);
          }
        }

        const latestMessage = (
          await channel.messages.fetch({ limit: 1 })
        ).first();

        if (latestMessage !== undefined) {
          messages.push({
            content: latestMessage.content,
            type: latestMessage.type,
            author: {
              id: latestMessage.author.id,
              bot: latestMessage.author.bot,
              username: latestMessage.author.username,
              globalName: latestMessage.author.globalName,
              avatar: latestMessage.author.avatar,
            },
            pinned: latestMessage.pinned,
            tts: latestMessage.tts,
            embeds: latestMessage.embeds,
            components: latestMessage.components,
            attachments: latestMessage.attachments,
            stickers: latestMessage.stickers,
            reactions: latestMessage.reactions,
          });
        }

        await fetchMessagesBefore(latestMessage);

        const channelData = {
          channelID: channel.id,
          channelName: channel.name,
          channelMessages: Array.from(messages.values()).reverse(),
        };

        allChannelsMessages.push(channelData);
        messages = [];
      }
    }

    function generateRandomId(length = 12) {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let randomId = Array.from(
        { length },
        () => characters[Math.floor(Math.random() * characters.length)]
      ).join("");
      return randomId;
    }
    async function editMessage(interaction, embed) {
      await interaction.editReply({ embeds: [embed] }).catch((err) => {
        return;
      });
    }
    async function saveChannelsAndCategories() {
      try {
        const channels = await interaction.guild.channels.fetch();

        if (channels.size === 0) return console.log("Server has no channels");

        // Getting And Saving channels/categories data.
        await editMessage(
          interaction,
          globalSuccessRateEmbed.setDescription("Saving server channels...")
        );
        channels.each(async (channel) => {
          if (
            channel.id === interaction.guild.safetyAlertsChannelId ||
            channel.id === interaction.guild.rulesChannelId ||
            channel.id === interaction.guild.publicUpdatesChannelId
          ) {
          }

          if (channel.type === ChannelType.GuildCategory) {
            const categoryId = channel.id;

            const categoryData = {
              parentData: {
                id: categoryId,
                name: channel.name,
                position: channel.position,
                type: channel.type,
                permissionOverwrites: channel.permissionOverwrites,
              },
              channels: [],
            };

            channels.each(async (childChannel) => {
              if (
                childChannel.parent &&
                childChannel.parent.id === categoryId
              ) {
                await structureChannels(
                  childChannel,
                  categoryData.channels,
                  true
                );
              }
            });
            allChannelsData.push(categoryData);
          } else if (!channel.parent) {
            await structureChannels(channel, allChannelsData, false);
          }
        });

        // Getting and saving roles data.
        await editMessage(
          interaction,
          globalSuccessRateEmbed.setDescription("Saving server roles...")
        );
        const roles = await interaction.guild.roles.fetch();
        await roles.each((role) => {
          if (role.name === "@everyone") return;
          if (role.tags && role.tags.botId) return;
          allRoles.push({
            name: role.name,
            color: role.color,
            hoist: role.hoist,
            permissions: role.permissions.bitfield.toString(),
            position: role.position,
            mentionable: role.mentionable,
            icon: role.icon,
            unicodeEmoji: role.unicodeEmoji,
          });
        });

        // Getting and saving bans
        await editMessage(
          interaction,
          globalSuccessRateEmbed.setDescription("Saving server bans...")
        );
        completeBanIdList = await (async (a = [], last = 0, limit = 1000) => {
          while (limit === 1000) {
            let bans = await interaction.guild.bans.fetch({
              after: last,
              limit: limit,
            });
            let banlist = bans.map((user) => user.user.id);

            last = bans.last().user.id;
            limit = banlist.length;

            for (let i = 0; i < limit; i++) {
              a.push(banlist[i]);
            }
          }

          return a;
        })().catch(() => {
          return;
        });
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    }
    async function getTotalMessages(interaction) {
      let totalServerMessages = 0;
      const channels = await interaction.guild.channels.fetch();

      for (const channel of channels.values()) {
        if (channel.type !== ChannelType.GuildText) {
          continue;
        }

        await fetchMessagesBefore(channel);
      }

      return totalServerMessages;

      async function fetchMessagesBefore(channel) {
        let singleChannelmessage = 0;
        let lastMessageId = null;

        do {
          await editMessage(
            interaction,
            globalSuccessRateEmbed.setDescription(
              "Getting server channels messages..."
            )
          );
          const options = { limit: 100 };

          if (lastMessageId) {
            options.before = lastMessageId;
          }

          const messages = await channel.messages.fetch(options);

          if (messages.size > 0) {
            singleChannelmessage += messages.size;
            totalServerMessages += messages.size;
            lastMessageId = messages.last().id;
          } else {
            lastMessageId = null;
          }
        } while (lastMessageId);
      }
    }
    async function structureChannels(channel, category, isCategory) {
      const channelTypeMap = {
        [ChannelType.GuildVoice]: [
          "bitrate",
          "userLimit",
          "rtcRegion",
          "videoQualityMode",
        ],
        [ChannelType.GuildText]: [
          "topic",
          "lastMessageId",
          "nsfw",
          "rateLimitPerUser",
        ],
        [ChannelType.GuildForum]: [
          "topic",
          "lastMessageId",
          "nsfw",
          "rateLimitPerUser",
          "availableTags",
          "defaultReactionEmoji",
          "defaultThreadRateLimitPerUser",
          "defaultAutoArchiveDuration",
        ],
        [ChannelType.GuildAnnouncement]: [
          "topic",
          "lastMessageId",
          "nsfw",
          "rateLimitPerUser",
        ],
        [ChannelType.GuildStageVoice]: [
          "bitrate",
          "userLimit",
          "rtcRegion",
          "topic",
        ],
      };

      const channelData = {
        channelid: channel.id,
        type: channel.type,
        name: channel.name,
        position: channel.position,
        permissionOverwrites: channel.permissionOverwrites.cache,
      };

      const typeProperties = channelTypeMap[channel.type] || [];
      typeProperties.forEach((property) => {
        channelData[property] = channel[property];
      });
      category.push(channelData);
    }
  },
};
