const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const DBUser = mongoose.model("DBUser");

exports.authenticate = (email, password) => {
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