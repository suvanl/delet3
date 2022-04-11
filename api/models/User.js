import mongoose from "mongoose";
import timestamp from "mongoose-timestamp";

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
    pointsUpdatedTimestamp: {
        type: Number,
        default: 1
    },
    triviaPoints: {
        type: Number,
        default: 0
    }
});

UserSchema.plugin(timestamp);

const User = mongoose.model("User", UserSchema);
export default User;