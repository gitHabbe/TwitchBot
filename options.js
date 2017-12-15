const botAuth = require('./private/botAuth.js');
const fs = require('fs');

// let channel_list;
const channel_list = fs.readFileSync('./private/channels.txt', 'utf8');

const options = {
    options: {
        clientId: botAuth.clientID,
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: botAuth.username,
        password: botAuth.password
    },
    channels: ['#' + channel_list],
    logger: {

    }
}

module.exports = {
    options: options
}
