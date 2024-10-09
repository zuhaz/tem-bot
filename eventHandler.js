const fs = require("node:fs");
const path = require("node:path");
async function eventHandler(client) {
  await client.events.clear();
  const foldersPath = path.join(__dirname, "events");
  const eventsFolders = await fs.readdirSync(foldersPath);
  for (const folder of eventsFolders) {
    const eventsPath = path.join(foldersPath, folder);
    const eventsFiles = await fs
      .readdirSync(eventsPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of eventsFiles) {
      const filePath = path.join(eventsPath, file);
      const event = require(filePath);
      const execute = (...args) => event.execute(...args, client);
      client.events.set(event.name, execute);
      if (event.rest) {
        if (event.once) client.rest.on(event.name, execute);
        else client.rest.on(event.name, execute);
      } else {
        if (event.once) client.once(event.name, execute);
        else client.on(event.name, execute);
      }
    }
  }
}

module.exports = { eventHandler };
