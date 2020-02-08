const errors = require("restify-errors");
const Guild = require("../models/Guild");

module.exports = server => {
    // Get guilds
    server.get("/guilds", async (req, res, next) => {
        try {
            const guilds = await Guild.find({});
            res.send(guilds);
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });

    // Get single guild
    server.get("/guilds/:id", async (req, res, next) => {
        try {
            const guild = await Guild.findById(req.params.id);
            res.send(guild);
            next();
        } catch (err) {
            return next(new errors.ResourceNotFoundError(`No such guild with ID ${req.params.id}`));
        }
    });

    // Add guild
    server.post("/guilds", async (req, res, next) => {
        // Ensure Content-Type is application/json
        if (!req.is("application/json")) return next(new errors.InvalidContentError("Expects 'application/json'"));

        const { guildID, 
            name, 
            adminRole, 
            autoRoleEnabled, 
            autoRoleName, 
            language, 
            modLogChannel, 
            modLogData,
            modLogEnabled, 
            modRole, 
            prefix, 
            welcomeChannel, 
            welcomeEnabled, 
            welcomeMessage } = req.body;

        const guild = new Guild({
            guildID,
            name, 
            adminRole, 
            autoRoleEnabled, 
            autoRoleName, 
            language, 
            modLogChannel, 
            modLogData,
            modLogEnabled, 
            modRole, 
            prefix, 
            welcomeChannel, 
            welcomeEnabled, 
            welcomeMessage
        });

        try {
            const newGuild = await guild.save();
            res.send(201);
            next();
        } catch (err) {
            return next(new errors.InternalError(err.message));
        }
    });

    // Update guild
    server.put("/guilds/:id", async (req, res, next) => {
        // Ensure Content-Type is application/json
        if (!req.is("application/json")) return next(new errors.InvalidContentError("Expects 'application/json'"));

        try {
            const guild = await Guild.findOneAndUpdate({ _id: req.params.id }, req.body);
            res.send(200);
            next();
        } catch (err) {
            return next(new errors.ResourceNotFoundError(`No such guild with ID ${req.params.id}`));
        }
    });

    // Delete guild
    server.del("/guilds/:id", async (req, res, next) => {
        try {
            const guild = await Guild.findOneAndRemove({ _id: req.params.id });
            res.send(204);
            next();
        } catch (err) {
            return next(new errors.ResourceNotFoundError(`No such guild with ID ${req.params.id}`));
        }
    });
};