export default client => {
    client.sendErrorToModLog = async (modLogChannel, settings, title, error) => {
        if (settings.modLogEnabled && modLogChannel) return modLogChannel.send(`❌ [${title}]: \`${error.message}\``);
    };
};
