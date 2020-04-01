const mongoose = require("mongoose");
const timestamp = require("mongoose-timestamp");

const UserSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    guildID: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    triviaPoints: {
        type: Number,
        default: 0
    }
});

UserSchema.plugin(timestamp);

const User = mongoose.model("User", UserSchema);
module.exports = User;