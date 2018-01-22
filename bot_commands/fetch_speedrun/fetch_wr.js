const axios = require('axios');
const twitchAPI = require('../../private/twitch_api.js');
const util = require('../../private/util.js');

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

const fetch_speedrun_uri = (uri) => {
    return axios.get(uri);
};

const get_correct_category = (category_list, title) => {
    console.log('TITLE: ' + title.toLowerCase());
    let found_category = category_list.find(category => {
        console.log('CATEGORY: ' + category.name.toLowerCase());
        return title.toLowerCase().includes(category.name.toLowerCase())
    })
    // console.log(found_category);
    return { uri: get_game_link(found_category, 'leaderboard'), name: found_category.name }
};

const get_game_link = (object, link_name) => {
    // return object.links.find(link => link.rel === link_name).uri;
    return object.links.find(link => {
        return link.rel === link_name
    }).uri;
};
async function fetch_wr(info_object) {
    let channel = 'Hagginater';
    console.log('ASDF');
    const twitch_channel = await get_twitch_channel(channel);
    const twitch_game = await get_twitch_game(twitch_channel.data.data[0].game_id);
    const speedrun_game = await get_speedrungame_by_name(twitch_game.data.data[0].name);
    const category_uri =  get_game_link(speedrun_game.data.data[0], 'categories');
    const category_list = await fetch_speedrun_uri(category_uri);
    const leaderboard_object = get_correct_category(category_list.data.data, twitch_channel.data.data[0].title);
    const category_leaderboard = await fetch_speedrun_uri(leaderboard_object.uri);
    const wr_holder = await fetch_speedrun_uri(category_leaderboard.data.data.runs[0].run.players[0].uri);

    const date = new Date(category_leaderboard.data.data.runs[0].run.date)
    const days_ago = Math.floor((new Date() - date) / 86400000)

    return {
        player: wr_holder.data.data.names.international,
        time: util.secondsToString(category_leaderboard.data.data.runs[0].run.times.primary_t),
        category: leaderboard_object.name,
        // game: category_leaderboard.data.data[0].name,
        date: category_leaderboard.data.data.runs[0].run.date,
        days_ago: days_ago
    };
}

module.exports = {
    fetch_wr: fetch_wr
};
