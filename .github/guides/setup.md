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


## Rest API details
Note that the following steps are recommendations. You can set these values as desired, as long as you know what you're doing.
1. Set the PORT value as desired, e.g. `1234`.
2. Set the URL value as `http://localhost:<PORT>`, ensuring `<PORT>` is replaced with the value you set for the PORT value above.


## OpenWeatherMap API key
1. Create an [OpenWeatherMap](https://openweathermap.org/) account
2. Go to the [API keys](https://home.openweathermap.org/api_keys) page, and generate a new key.


## YouTube API key
Instructions for getting a YouTube Data API key can be found here: https://developers.google.com/youtube/v3/getting-started#before-you-start


## Spotify
1. [Register a new app](https://developer.spotify.com/documentation/general/guides/app-settings/#register-your-app)
2. Copy and paste your client ID and client secret into the `.env` file.