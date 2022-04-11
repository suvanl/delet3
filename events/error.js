export default async (client, error) => {
    client.logger.err(`WS/API error:\n${error}`);
};