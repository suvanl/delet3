const mongoose = require("mongoose");

const DBUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

const DBUser = mongoose.model("DBUser", DBUserSchema);
module.exports = DBUser;