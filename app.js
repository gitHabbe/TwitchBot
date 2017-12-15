const tmi = require('tmi.js');
const options = require('./options.js');
const commands = require('./bot_commands/all_commands.js');

var client = new tmi.client(options.options);

client.connect()

client.on('connected', (address, port) => {
    console.log(`CONNECTED: ${address}:${port}`);
})
client.on('join', (channel, username, self) => {
    console.log(username + ' has joined!');
})
client.on('part', (channel, username, self) => {
    console.log(username + ' has left...');
})

client.on('chat', (channel, userstate, message, self) => {
    switch (message) {
        case '!wr':

            break;
        default:

    }
})
