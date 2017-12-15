const tmi = require('tmi.js');
const options = require('./options.js')

var client = new tmi.client(options);

client.connect();

client.action("#habbe", "Test message");
