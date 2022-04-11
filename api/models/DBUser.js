import mongoose from "mongoose";

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

export const DBUser = mongoose.model("DBUser", DBUserSchema);
