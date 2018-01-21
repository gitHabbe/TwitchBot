const fs = require('fs');
const botAuth = require('./private/botAuth.js');

let channel_list = [];
try {
    const channel_string = fs.readFileSync('./private/channels.txt', 'utf8').slice(0, -1);
    channel_list = channel_string.split('\n');
    console.log(channel_list);
} catch (e) {
    console.log('File error: ' + e);
}

const options = {
    options: {
        clientId: botAuth.clientID,
        debug: true
    },
    connection: {
        reconnect: true,
        secure: true
    },
    channels: channel_list,
    identity: {
        username: botAuth.auth.username,
        password: botAuth.auth.password
    }
}

module.exports = {
    options: options
}
