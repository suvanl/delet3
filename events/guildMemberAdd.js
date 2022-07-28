import fetch from "node-fetch";
import { PermissionsBitField } from "discord.js";

// verificationChannel permissionOverwrites for admins/mods
const allowedAdminPerms = [
    PermissionsBitField.Flags.ViewChannel,
    PermissionsBitField.Flags.SendMessages,
    PermissionsBitField.Flags.ReadMessageHistory,
    PermissionsBitField.Flags.UseApplicationCommands
];

// verificationChannel permissionOverwrites for unverified users
const allowedUnverifiedUserPerms = [
    PermissionsBitField.Flags.ViewChannel,
    PermissionsBitField.Flags.SendMessages,
    PermissionsBitField.Flags.UseApplicationCommands
];

export default async (client, member) => {
    // Save new guildMember to DB
    const secret = await client.genSecret();

    const url = `${process.env.URL}/users`;
    const body = { "userID": member.user.id, "guildID": member.guild.id };
    const meta = { "Content-Type": "application/json", "Authorization": `jwt ${secret.token}` };

    try {
        await fetch(url, {
            method: "post",
            body: JSON.stringify(body),
            headers: meta
        });
    } catch (err) {
        return client.logger.error(`Error saving new guildMember:\n${err.stack}`);
    }

    // Get guild settings
    const settings = await client.getSettings(member.guild);

    // If autoRoleEnabled is set to true...
    if (settings.autoRoleEnabled === true) {
        // Find the required role by name; if it isn't found, return
        const role = member.guild.roles.cache.find(r => r.name === settings.autoRoleName);
        if (!role) return;

        // Add the role (by ID) to the guildMember
        member.roles.add(role.id);
    }

    // If verificationEnabled is set to true...
    if (settings.verificationEnabled === true) {
        // Find the mod log channel (required for error logging)
        const modLog = client.findChannelByName(member.guild, settings.modLogChannel);

        // Find the "_unverified_user" role. The underscore prefix exists to avoid role name clashes.
        let unverifiedRole = client.findRoleByName(member.guild, "_unverified_user");
        if (!unverifiedRole) {
            // Create the role if it doesn't already exist
            try {
                await member.guild.roles.create({ name: "_unverified_user", reason: "Required for delet3's verification system" });

                // Find the role again, now that it has been created
                unverifiedRole = client.findRoleByName(member.guild, "_unverified_user");
            } catch (err) {
                client.sendErrorToModLog(modLog, settings, "guildMemberAdd/Verification Error", err);
                client.logger.error(`Error creating '_unverified_user' role. Guild info: '${member.guild.name}' (${member.guild.id}).\n${err}`);
            }
        }

        // Find the verificationChannel defined in settings
        let verifChannel = client.findChannelByName(member.guild, settings.verificationChannel);
        if (!verifChannel) {
            // Create the channel if it doesn't already exist
            try {
                await member.guild.channels.create(settings.verificationChannel, {
                    reason: "delet3 verification system",
                    permissionOverwrites: [
                        { id: member.guild.id, deny: [Permissions.FLAGS.VIEW_CHANNEL] },                                    // @everyone
                        { id: client.user.id, allow: allowedAdminPerms },                                                   // delet3
                        { id: client.findRoleByName(member.guild, settings.adminRole), allow: allowedAdminPerms },          // adminRole
                        { id: client.findRoleByName(member.guild, settings.modRole), allow: allowedAdminPerms },            // modRole
                        { id: client.findRoleByName(member.guild, "_unverified_user"), allow: allowedUnverifiedUserPerms }  // _unverified_user
                    ]
                });

                // Find the channel again, now that it has been created
                verifChannel = await client.findChannelByName(member.guild, settings.verificationChannel);
            } catch (err) {
                client.sendErrorToModLog(modLog, settings, "guildMemberAdd/Verification Error", err);
                client.logger.error(`Error creating verificationChannel. Guild info: '${member.guild.name}' (${member.guild.id}).\n${err}`);
            }
        }

        // Give the current member the unverifiedRole
        try {
            await member.roles.add(unverifiedRole);
        } catch (err) {
            client.sendErrorToModLog(modLog, settings, "guildMemberAdd/Verification Error", err);
            client.logger.error(`Error giving '_unverified_user' role to ${member.user.tag} (${member.user.id}). Guild info: '${member.guild.name}' (${member.guild.id}).\n${err}`);
        }

        // Add the current member to the verificationQueue
        await client.addToVerifQueue(member.guild, member.user.id);
    }

    // If welcomeEnabled is set to true...
    if (settings.welcomeEnabled === true) {
        // Replace placeholders with actual data
        const welcomeStr = settings.welcomeMessage;
        const mapObj = { "{{server}}": member.guild.name, "{{user}}": member.user.tag };

        const msg = welcomeStr.replace(/{{server}}|{{user}}/g, matched => {
            return mapObj[matched];
        });

        // Find welcomeChannel and send welcomeMessage to it
        member.guild.channels.cache.find(c => c.name === settings.welcomeChannel).send(msg);
    }
};
