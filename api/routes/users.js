const errors = require("restify-errors");
const User = require("../models/User");

module.exports = server => {
    // Get users
    server.get("/users", async (req, res, next) => {
        try {
            const users = await User.find({});
            res.send(users);
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });

    // Get single user by user ID
    server.get("/users/:id", async (req, res, next) => {
        try {
            const user = await User.find({ "userID": req.params.id });
            res.send(user);
            next();
        } catch (err) {
            return next(new errors.ResourceNotFoundError(`No such user with ID ${req.params.id}`));
        }
    });

    // Add user
    server.post("/users", async (req, res, next) => {
        // Ensure Content-Type is application/json
        if (!req.is("application/json")) return next(new errors.InvalidContentError("Expects 'application/json'"));

        const { userID, points, triviaPoints } = req.body;

        const user = new User({
            userID,
            points,
            triviaPoints
        });

        try {
            await user.save();
            res.send(201);
            next();
        } catch (err) {
            return next(new errors.InternalError(err.message));
        }
    });

    // Update user
    server.put("/users/:id", async (req, res, next) => {
        // Ensure Content-Type is application/json
        if (!req.is("application/json")) return next(new errors.InvalidContentError("Expects 'application/json'"));

        try {
            await User.findOneAndUpdate({ userID: req.params.id }, req.body);
            res.send(200);
            next();
        } catch (err) {
            return next(new errors.ResourceNotFoundError(`No such user with ID ${req.params.id}`));
        }
    });

    // Delete user
    server.del("/users/:id", async (req, res, next) => {
        try {
            await User.findOneAndRemove({ userID: req.params.id });
            res.send(204);
            next();
        } catch (err) {
            return next(new errors.ResourceNotFoundError(`No such user with ID ${req.params.id}`));
        }
    });
};