const mongoose = require("mongoose");

module.exports = mongoose.model(
  "backupsDataDB",
  new mongoose.Schema({
    Id: String,
    BackupName: String,
    CreatorId: String,
    CreatedAt: String,
    ChannelsData: Array,
    ChannelsMessages: Array,
    RolesData: Array,
    Bans: Array,
  })
);
