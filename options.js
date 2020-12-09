// Array of channels to join
const channels = require("./private/channels.json");

module.exports = {
    options: {
        clientId: process.env.TMI_CLIENT,
        debug: true
    },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: process.env.TMI_USERNAME,
        password: process.env.TMI_TOKEN
    },
    channels: channels
};
