export const run = async (client, interaction) => {
    await client.commands.get("about").run(client, interaction);
};

export const data = {
    name: "permtest",
    description: "Permissions test",
    options: [],
    defaultPermission: false
};

export const permissions = [{
    id: "203604445051748353",
    type: "USER",
    permission: false
}];

export const global = false;
