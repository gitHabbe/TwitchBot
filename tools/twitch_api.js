const axios = require('axios');
const auth = require('../private/botAuth.js');

const instance = axios.create({
    baseURL: 'https://api.twitch.tv/helix',
    headers: {
        'Client-ID': auth.auth.clientID
    }
})

module.exports = instance;
