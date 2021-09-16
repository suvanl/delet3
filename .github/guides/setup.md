# Setting up environment variables

## Bot token
1. Log into the Discord Developer Portal and head to the [Applications](https://discord.com/developers/applications) section
2. Hit "New Application"
3. Fill out the required information and register a bot account with the application you've created
4. Navigate to your application's "Bot" page
5. Copy your token and paste it into the `.env` file.


## Dev/base guild ID
This is the ID of the development/testing/base/hub (whatever you want to call it, really) guild for delet3.
Guild-only ApplicationCommands (slash commands) will be deployed to this guild.

Guild-only slash commands are used for testing slash commands before deploying them publicly.


## MongoDB
1. Sign into [MongoDB Cloud](https://www.mongodb.com/cloud)
2. Create a new cluster
3. Click on "Database Access" on the SECURITY section on the menu on the left hand side
4. Add a new database user
5. Set the authentication method to password
6. Create a new username and password
7. Whitelist your IP address under the "Network Access" section
8. Go to "Clusters" under the Data Storage section in the left-hand menu
9. Click on "CONNECT" on the cluster you're using for delet<sup>3</sup>
10. Select "Connect your application"
11. Ensure the Driver is set to Node.js and change the version to 2.2.12 or later
12. Copy and paste the connection string into the `.env` file
13. Replace `<password>` with the password for the `<username>` user. Replace `<dbname>` with the name of the database that connections will use by default.


## Rest API details
Note that the following steps are recommendations. You can set these values as desired, as long as you know what you're doing.
1. Set the PORT value as desired, e.g. `1234`.
2. Set the URL value as `http://localhost:<PORT>`, ensuring `<PORT>` is replaced with the value you set for the PORT value above.


<!-- TODO -->
## Rest API login
Fill in these values last, after you've entered all the other keys into the `.env` file.
1. Open the **index.js** file in the project root directory
2. Find the block of code labelled "Set up REST API server"
3. Edit the following line:
    ```js
    server.use(rjwt({ secret: JWT_SECRET }).unless({ path: ["/auth"] }));
    ```
    Add "/register" to the array; i.e.: 
    ```js
    { path: ["/register", "/auth" ]}
    ```
4. Follow the instructions in the main README file to start up the bot
5. Using a REST client such as [Postman](https://www.postman.com/product/rest-client/), send a **POST** request to `<REST API BASE URL>/register` (e.g. `http://localhost:1234/register`)
6. The body of this request should contain two JSON keys: an `email` and a `password` of your choice
7. The request's `Content-Type` header should be set to `application/json`.
8. A successful request will return a "201 Created" status code
9. Undo and save the changes you made to the **index.js** file
10. Copy and paste the username and password you created into the `.env` file.

Note that all passwords are hashed before being entered into your MongoDB collection. You can use MongoDB Atlas to delete users if necessary.

Clearly, these steps are tedious and a better way of doing this will be implemented prior to release. If you have any suggestions about improving this, please create an issue/pull request.


## JWT secret
Enter your desired JWT (JSON Web Token) secret.


## OpenWeatherMap API key
1. Create an [OpenWeatherMap](https://openweathermap.org/) account
2. Go to the [API keys](https://home.openweathermap.org/api_keys) page, and generate a new key.


## YouTube API key
Instructions for getting a YouTube Data API key can be found here: https://developers.google.com/youtube/v3/getting-started#before-you-start

## Spotify
1. [Register a new app](https://developer.spotify.com/documentation/general/guides/app-settings/#register-your-app)
2. Copy and paste your client ID and client secret into the `.env` file.