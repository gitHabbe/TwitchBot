const axios = require("axios");

const instance = axios.create({
    baseURL: "https://api.twitch.tv/helix",
    headers: {
        "Client-ID": process.env.TMI_CLIENT
    }
});

module.exports = instance;
