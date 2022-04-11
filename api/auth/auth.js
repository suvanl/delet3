import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const DBUser = mongoose.model("DBUser");

export const authenticate = (email, password) => {
    return new Promise(async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
        try {
            // Get database user by email
            const dbuser = await DBUser.findOne({ email });

            // Match password
            bcrypt.compare(password, dbuser.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) resolve(dbuser);
                else reject("Authentication failed");
            });
        } catch (err) {
            // If email not found
            reject("Authentication failed");
        }
    });
};