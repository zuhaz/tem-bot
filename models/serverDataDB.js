const mongoose = require("mongoose");

module.exports = mongoose.model(
  "serverDataDB",
  new mongoose.Schema({
    GuildID: String,
    Backups: Array,
    BackupIDs: Array,
    BackupQuota: Number,
    SuccessStates: Array
  })
);
