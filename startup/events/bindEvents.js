import * as events from "../../events";

export default async client => {
    client.on("error", events.error.bind(null, client));
    client.on("guildCreate", events.guildCreate.bind(null, client));
    client.on("guildDelete", events.guildDelete.bind(null, client));
    client.on("guildMemberAdd", events.guildMemberAdd.bind(null, client));
    client.on("guildMemberRemove", events.guildMemberRemove.bind(null, client));
    client.on("interactionCreate", events.interactionCreate.bind(null, client));
    client.on("messageCreate", events.messageCreate.bind(null, client));
    client.on("ready", events.ready.bind(null, client));
};
