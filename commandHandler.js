const fs = require("node:fs");
const path = require("node:path");
async function commandHandler(client) {
  await client.commands.clear();
  const commands = [];
  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = await fs.readdirSync(foldersPath);
  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = await fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      client.commands.set(command.name, command);
      commands.push(command);
    }
  }
  client.application.commands.set(commands);
}

module.exports = { commandHandler };
