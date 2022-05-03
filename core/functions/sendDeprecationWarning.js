export default client => {
    client.sendDeprecationWarning = async (message, info) => {
        return message.reply(`⚠ **Deprecation Warning**: this text command has been deprecated and will soon be removed.\n➡ Details: ${info}`);
    };
};
