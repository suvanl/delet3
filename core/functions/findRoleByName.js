export default client => {
    client.findRoleByName = (guild, roleName) => guild.roles.cache.find(r => r.name === roleName);
};
