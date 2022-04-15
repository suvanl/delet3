import fetch from "node-fetch";

export default client => {
    // Generate secret
    client.genSecret = async () => {
        try {
            const url = `${process.env.URL}/auth`;
            const body = { "email": process.env.DB_EMAIL, "password": process.env.DB_PASS };
    
            const res = await fetch(url, {
                method: "post",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();
            return data;
        } catch (err) {
            client.logger.error(err.stack);
        }
    };
};