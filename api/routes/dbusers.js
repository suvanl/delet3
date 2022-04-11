import errors from "restify-errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as DBUser from "../models/DBUser";
import * as auth from "../auth/auth";

const { JWT_SECRET } = process.env;

export default server => {
    // Register database user
    server.post("/register", (req, res, next) => {
        const { email, password } = req.body;
        const dbuser = new DBUser({
            email,
            password
        });

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(dbuser.password, salt, async (err, hash) => {
                // Hash password
                dbuser.password = hash;

                // Save user
                try {
                    await dbuser.save();
                    res.send(201);
                    next();
                } catch (err) {
                    return next(new errors.InternalError(err.message));
                }
            });
        });
    });

    // Authenticate database user
    server.post("/auth", async (req, res, next) => {
        const { email, password } = req.body;

        try {
            const dbuser = await auth.authenticate(email, password);
            const token = jwt.sign(dbuser.toJSON(), JWT_SECRET, { expiresIn: "1h" });
            const { iat, exp } = jwt.decode(token);
            // Respond with token
            res.send({ iat, exp, token });
            next();
        } catch (err) {
            // If user is unauthorised
            return next(new errors.UnauthorizedError(err));
        }
    });
};