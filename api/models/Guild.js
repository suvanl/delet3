const mongoose = require("mongoose");
const timestamp = require("mongoose-timestamp");

const GuildSchema = new mongoose.Schema({
    guildID: {
        type: Number,
        default: 0,
        required: true
    },
    name: {
        type: String,
        default: "New Guild",
        required: true,
        trim: true
    },
    settings: {
        adminRole: {
            type: String,
            default: "Admin",
            trim: true
        },
        autoRoleEnabled: {
            type: Boolean,
            default: false,
            trim: true
        },
        autoRoleName: {
            type: String,
            default: "Member",
            trim: true
        },
        language: {
            type: String,
            default: "en-GB",
            trim: true
        },
        modLogChannel: {
            type: String,
            default: "mod-log",
            trim: true
        },
        modLogData: {
            type: Array,
            default: ["joinLeave", "nameChange", "kickBan"],
            trim: true
        },
        modLogEnabled: {
            type: Boolean,
            default: false,
            trim: true
        },
        modRole: {
            type: String,
            default: "Moderator",
            trim: true
        },
        prefix: {
            type: String,
            default: "%",
            trim: true
        },
        welcomeChannel: {
            type: String,
            default: "general",
            trim: true
        },
        welcomeEnabled: {
            type: Boolean,
            default: false,
            trim: true
        },
        welcomeMessage: {
            type: String,
            default: "Welcome to {{server}}, {{user}}!",
            trim: true
        }
    }
    
});

GuildSchema.plugin(timestamp);

const Guild = mongoose.model("Guild", GuildSchema);
module.exports = Guild;