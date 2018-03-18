const fs = require('fs');

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
        clientId: process.env.TMI_CLIENT_ID,
        debug: true
    },
    connection: {
        reconnect: true,
        secure: true
    },
    channels: channel_list,
    identity: {
        username: process.env.TMI_USERNAME,
        password: process.env.TMI_PASSWORD
    }
}

module.exports = {
    options: options
}
