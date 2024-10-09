const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionFlagsBits
} = require("discord.js");
const { ButtonStyle, ChannelType } = require("discord.js");

module.exports = {
  name: "test",
  description: "Test command",
  userPermissions: [PermissionFlagsBits.Administrator],
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: false });
    console.log(interaction.guild.members);
    // await interaction.editReply({ content: "Fetching roles...", });
    // const allRoles = [];
    // try {
    //     const roles = await interaction.guild.roles.fetch();
    //     roles.each((role) => {
    //         if (role.name === "@everyone") return
    //         if (role.tags && role.tags.botId) return
    //         allRoles.push({
    //             name: role.name,
    //             color: role.color,
    //             hoist: role.hoist,
    //             permissions: role.permissions,
    //             position: role.position,
    //             mentionable: role.mentionable,
    //             icon: role.icon,
    //             unicodeEmoji: role.unicodeEmoji
    //         })

    //     })

    //     interaction.guild.roles.cache.each(role => {
    //         if (role.editable && role.name !== "@everyone") {
    //             role.delete().catch(err => console.log(err));
    //         }
    //     });
    //     for (const role of allRoles) {
    //         await interaction.guild.roles.create({
    //             name: role.name,
    //             color: role.color,
    //             hoist: role.hoist,
    //             permissions: role.permissions,
    //             position: role.position,
    //             mentionable: role.mentionable,
    //             icon: role.icon,
    //             unicodeEmoji: role.unicodeEmoji
    //         })
    //     }
    //     console.log(allRoles)
    // } catch (err) {
    //     console.error("Error fetching roles:", err);
    // }
    // interaction.guild.bans.fetch().then((banned)=>{
    //     banned.each((bannedUser)=>{
    //         console.log(bannedUser)
    //     })
    // })

    // console.log(completeBanIdList);
    // for (let i = 0; i < 100; i++) {
    //   interaction.channel.send({ content: "Spam 2" });
    // }
    // const messages = [];

    // const channel = client.channels.cache.get(interaction.channel.id);

    // console.log(messages[0]);
    // const channels = await interaction.guild.channels.fetch();
    // for (const channel of channels.values()) {
    //   if (channel.type === ChannelType.GuildCategory) continue;
    //   for (let i = 0; i < 20; i++) {
    //     await channel
    //       .send({
    //         content: "Testing",
    //         embeds: [
    //           new EmbedBuilder()
    //             // .setColor("#ffffff")
    //             .setTitle("Test embed")
    //             .setDescription("Test description")
    //             .setAuthor({
    //               name: interaction.user.username,
    //               iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    //             })
    //             .setFooter({
    //               text: "Test footer",
    //               iconURL: interaction.client.user.displayAvatarURL({
    //                 dynamic: true,
    //               }),
    //             })
    //             .setImage(interaction.user.displayAvatarURL({ dynamic: true }))
    //             .addFields(
    //               {
    //                 name: "Test Field",
    //                 value: "Test field value",
    //                 inline: true,
    //               },
    //               {
    //                 name: "Test Field 2",
    //                 value: "Test field value2 ",
    //                 inline: true,
    //               }
    //             )
    //             .setThumbnail(
    //               interaction.user.displayAvatarURL({ dynamic: true })
    //             ),
    //         ],
    //         components: [
    //           new ActionRowBuilder().addComponents(
    //             new ButtonBuilder()
    //               .setCustomId("test-message-button")
    //               .setLabel("Test Button")
    //               .setStyle(ButtonStyle.Success)
    //           ),
    //         ],
    //         files: [
    //           {
    //             attachment: "./image.jpg",
    //             name: "testimage.jpg",
    //           },
    //         ],
    //       })
    //       .catch((err) => {
    //         return;
    //       });
    //   }
    // }
  },
};
