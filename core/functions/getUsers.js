import fetch from "node-fetch";

export default client => {
    // Send GET request to API to fetch all users
    client.getUsers = async () => {
        const url = `${process.env.URL}/users`;
        try {
            const secret = await client.genSecret();
            const res = await fetch(url, {
                method: "get",
                headers: { "Authorization": `jwt ${secret.token}` }
            });
            
            const data = await res.json();
            return data;
        } catch (err) {
            return client.logger.error(`error in getUsers:\n${err.stack}`);
        }
    };
};