export default client => {
    client.findChannelByName = (guild, channelName) => guild.channels.cache.find(c => c.name === channelName);
};
