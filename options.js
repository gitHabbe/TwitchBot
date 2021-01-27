// Array of channels to join
const channels = require("./private/channels.json");

module.exports = {
    options: {
        clientId: process.env.TWITCH_CLIENT_ID,
        debug: true
    },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: process.env.TWITCH_USERNAME,
        password: "oauth:" + process.env.TWITCH_OAUTH_PASSWORD
    },
    channels
};
