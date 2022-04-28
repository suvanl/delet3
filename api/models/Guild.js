import mongoose from "mongoose";
import timestamp from "mongoose-timestamp";

const GuildSchema = new mongoose.Schema({
    guildID: {
        type: String,
        default: "0",
        required: true
    },
    name: {
        type: String,
        default: "New Guild",
        required: true,
        trim: true
    },
    caseNumber: {
        type: Number,
        default: 0
    },
    activePunishments: {
        bans: {
            type: Array,
            default: [],
            trim: true
        }
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
        nickRequestChannel: {
            type: String,
            default: "nick-requests",
            trim: true
        },
        nickRequestEnabled: {
            type: Boolean,
            default: false,
            trim: true
        },
        pointsEnabled: {
            type: Boolean,
            default: true,
            trim: true
        },
        pointsCooldown: {
            type: Number,
            default: 2
        },
        prefix: {
            type: String,
            default: "%",
            trim: true
        },
        verificationEnabled: {
            type: Boolean,
            default: false,
            trim: true
        },
        verificationQueue: {
            type: Array,
            default: []
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

export const Guild = mongoose.model("Guild", GuildSchema);
