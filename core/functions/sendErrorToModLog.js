export default client => {
    client.sendErrorToModLog = async (modLogChannel, settings, title, error) => {
        if (settings.modLogEnabled) {
            if (modLogChannel) return modLogChannel.send(`❌ [${title}]: \`${error.message}\``);
        }
    };
};
