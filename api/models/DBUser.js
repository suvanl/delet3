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

const DBUser = mongoose.model("DBUser", DBUserSchema);
export default DBUser;