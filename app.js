const tmi = require('tmi.js');
const options = require('./options.js')
const fs = require('fs');
const botAuth = require('./private/botAuth.js');

// const channel_list = fs.readFileSync('./private/channels.txt', 'utf8');
// options.channels = ['#habbe'];

console.log(options.options.channels);
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
client.api({
    url: "https://api.twitch.tv/kraken/users/habbe",
    method: "GET",
    headers: {
        "Accept": "application/vnd.twitchtv.v3+json",
        "Authorization": botAuth.auth.password,
        "Client-ID": botAuth.auth.clientID
    }
}, function(err, res, body) {
    console.log(body);
});
