const backupsDataDB = require("../../models/backupsDataDB");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    const { options, commandName } = interaction;
    const backupsData = await backupsDataDB.find({
      CreatorId: interaction.user.id,
    });
    if (interaction.isAutocomplete()) {
      switch (commandName) {
        case "backup-delete":
          {
            const focusedValue = options.getFocused();
            const filteredBackups = backupsData
              .filter((backup) => {
                return (
                  backup.Id.startsWith(focusedValue) ||
                  backup.BackupName.toLowerCase().includes(
                    focusedValue.toLowerCase()
                  )
                );
              })
              .slice(0, 25);
            const response = filteredBackups.map((backup) => {
              return {
                name: `${backup.BackupName} | ${new Date(
                  parseInt(backup.CreatedAt) * 1000
                ).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })} (${backup.Id})`,
                value: backup.Id,
              };
            });
            await interaction.respond(response);
          }
          break;
        case "backup-prev":
          {
            const focusedValue = options.getFocused();
            const filteredBackups = backupsData
              .filter((backup) => {
                return (
                  backup.Id.startsWith(focusedValue) ||
                  backup.BackupName.toLowerCase().includes(
                    focusedValue.toLowerCase()
                  )
                );
              })
              .slice(0, 25);
            const response = filteredBackups.map((backup) => {
              return {
                name: `${backup.BackupName} | ${new Date(
                  parseInt(backup.CreatedAt) * 1000
                ).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })} (${backup.Id})`,
                value: backup.Id,
              };
            });
            await interaction.respond(response);
          }
          break;
      }
    }
  },
};
