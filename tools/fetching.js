const axios = require("axios");
const twitchAPI = require("./twitch_api.js");

const fetch_speedrun_uri = uri => {
    return axios.get(uri);
};

const fetch_game_levels = id => {
    return axios.get(`https://www.speedrun.com/api/v1/games/${id}/levels`);
};

const get_speedrunner = name => {
    // return axios.get(encodeURI(`https://www.speedrun.com/api/v1/users?name=${name}`));
    return axios.get(encodeURI(`https://www.speedrun.com/api/v1/users?lookup=${name}`));
};

const get_twitch_channel = channel => {
    return twitchAPI.get(`/streams?user_login=${channel}`);
};

const get_twitch_followage = (streamer_id, viewer_id) => {
    return twitchAPI.get(`/users/follows?to_id=${streamer_id}&from_id=${viewer_id}`);
};

const get_twitch_game = game_id => {
    return twitchAPI.get(`/games?id=${game_id}`);
};

const get_leaderboard = (game_id, category_id, wr = false) => {
    if (wr) {
        return axios.get(
            encodeURI(`https://www.speedrun.com/api/v1/leaderboards/${game_id}/category/${category_id}?top=1`)
        );
    }
    return axios.get(encodeURI(`https://www.speedrun.com/api/v1/leaderboards/${game_id}/category/${category_id}`));
};

const get_twitch_videos = user_id => {
    return twitchAPI.get(`/videos?user_id=${user_id}`);
};

const get_speedrungame_by_name = game_name => {
    return axios.get(encodeURI(`https://www.speedrun.com/api/v1/games?name=${game_name}`));
};

const get_speedrungame_by_abbreviation = game_abbre => {
    return axios.get(encodeURI(`https://www.speedrun.com/api/v1/games?abbreviation=${game_abbre}`));
};

const get_speedrungame_by_id = game_id => {
    return axios.get(encodeURI(`https://www.speedrun.com/api/v1/games/${game_id}`));
};

const get_dkr64_track = (track, vehicle, laps, limit, shortcut = false, user = false) => {
    let url = `https://www.dkr64.com/api/times?api_token=${process.env.DKR64_API_TOKEN}`;
    url += `&track=${track}&vehicle=${vehicle}&laps=${laps}`;
    if (user) url += `&user=${user}`;
    else url += `&limit=${limit}`;
    if (shortcut) url += `&type=shortcut`;
    else url += `&type=standard`;

    return axios.get(url);
};

module.exports = {
    fetch_speedrun_uri,
    get_twitch_channel,
    get_twitch_followage,
    get_twitch_game,
    get_speedrungame_by_name,
    get_speedrungame_by_id,
    get_twitch_videos,
    get_speedrungame_by_abbreviation,
    get_leaderboard,
    get_speedrunner,
    fetch_game_levels,
    get_dkr64_track
};
