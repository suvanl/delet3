export default async (client, error) => {
    client.logger.error(`WS/API error:\n${error}`);
};