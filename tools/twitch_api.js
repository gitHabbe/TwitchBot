const axios = require("axios");

const instance = axios.create({
    baseURL: "https://api.twitch.tv/helix",
    headers: {
        "Client-Id": process.env.TWITCH_CLIENT_ID,
        "Authorization": `Bearer ${process.env.TWITCH_OAUTH_PASSWORD}`
    }
});

module.exports = instance;
