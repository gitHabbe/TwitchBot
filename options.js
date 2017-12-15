const botAuth = require('./private/botAuth.js');
const fs = require('fs');

try {
    const channel_list = fs.readFileSync('./private/channels.txt', 'utf8');
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
    channels: ['habbe'],
    identity: {
        username: botAuth.auth.username,
        password: botAuth.auth.password
    }
}

module.exports = {
    options: options
}
