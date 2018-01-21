const axios = require('axios');
const twitchAPI = require('../../private/twitch_api.js');
const util = require('../../private/util.js');


// function fetch_wr(info_object) {
//     let { channel, userstate, message, msg_game, msg_category, found_game_id } = info_object;
//     let fetch_wr_json = false;
//     // console.log(channel);
//     if (found_game_id) {
//         console.log('GAME ID FOUND');
//         fetch_wr_json = axios.get(`https://www.speedrun.com/api/v1/games/${found_game_id}`);
//     } else if (msg_game) {
//         fetch_wr_json = axios.get(`https://www.speedrun.com/api/v1/games/${msg_game}`);
//     } else {
//         console.log('NO GAME SPECIFIED 2');
//         console.log('DEFAULT ELSE');
//         const channel_info = fetch_channel_game(channel.slice(1));
//     }
//     return fetch_wr_json;
// }
const get_twitch_channel = (channel) => {
    return twitchAPI.get(`/streams?user_login=${channel}`);
};

const get_twitch_game = (game_id) => {
    return twitchAPI.get(`/games?id=${game_id}`);
};

const get_speedrungame_by_name = (game_name) => {
    return axios.get(`https://www.speedrun.com/api/v1/games?name=${game_name}`)
};

const get_speedrungame_by_id = (game_id) => {
    return axios.get(`https://www.speedrun.com/api/v1/games/${game_id}`)
};

const get_game_link = (object, link_name) => {
    return object.links.find(link => link.rel === link_name).uri;
};

const get_category_list = (uri) => {
    return axios.get(uri)
};

const get_correct_category = (category_list, title) => {
    console.log('TITLE: ' + title.toLowerCase());
    let found_category = category_list.find(category => {
        console.log('CATEGORY: ' + category.name.toLowerCase());
        return title.toLowerCase().includes(category.name.toLowerCase())
    })
    return { uri: get_game_link(found_category, 'leaderboard'), name: found_category.name }
};

const get_title_wr = (uri) => {
    return axios.get(uri);
};

const get_player_name = (uri) => {
    return axios.get(uri)
};

function fetch_wr(info_object) {
    // let { channel, userstate, message, found_game_id } = info_object;
    // if (found_game_id) {
    //     return get_speedrungame_by_id(found_game_id).then(res => {
    //     })
    // }
    channel = 'Isaia';

    return get_twitch_channel(channel)
        .then(norw => get_twitch_game(norw.data.data[0].game_id))
        .then(res => get_speedrungame_by_name(res.data.data[0].name))
        .then(res => {
            const category_uri = get_game_link(res.data.data[0], 'categories')
            return get_category_list(category_uri)
        })
        .then(res_category => {
            const leaderboard_object = get_correct_category(res_category.data.data, norw.data.data[0].title)
            return get_title_wr(leaderboard_object.uri)
        })
        .then(res_lb => get_player_name(res_lb.data.data.runs[0].run.players[0].uri))
        .then(res => {
            const date = new Date(res_lb.data.data.runs[0].run.submitted)
            const days_ago = Math.floor((new Date() - date) / 86400000)
            return {
                player: res.data.data.names.international,
                time: util.secondsToString(res_lb.data.data.runs[0].run.times.primary_t),
                category: leaderboard_object.name,
                // game: res_lb.data.data[0].name,
                date: res_lb.data.data.runs[0].run.submitted,
                days_ago: days_ago
            };
        })

}

module.exports = {
    fetch_wr: fetch_wr
};
