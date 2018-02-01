const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const fetching = require('./tools/fetching.js');
const check_id = require('./tools/check_id.js');
const util = require('./tools/util.js');

const get_wr = (info_object) => {

    let { channel, userstate, message } = info_object;

    const split_msg = message.split(' ');

    const msg_game = split_msg.length > 1 && split_msg[1];
    const msg_category = split_msg.length > 2 && split_msg[2];

    if (msg_game && msg_category) {
        info_object.msg_game = msg_game;
        info_object.msg_category = msg_category;
        return check_id.check_game_id(info_object);
    } else if (msg_game) {
        info_object.msg_game = msg_game;
        return check_id.check_game_id(info_object);
    } else if (msg_category) {
        info_object.msg_category = msg_category;
        return check_id.check_game_id(info_object);
    } else {
        console.log('No game specified, grabbing title');
        return check_id.check_game_id(info_object);
    }
};

async function get_uptime(info_object) {
    let { channel, message } = info_object;
    const twitch_channel = await fetching.get_twitch_channel(channel);
    const uptime_date = new Date(twitch_channel.data.data[0].started_at);
    const seconds_ago = Math.floor(((new Date() - uptime_date) / 1000))
    const time_string = util.secondsToString(seconds_ago)
    console.log(time_string);
    return time_string;
    // console.log(uptime_date);
    // console.log(twitch_channel.data.data);
};

async function get_title(info_object) {
    let { channel, message } = info_object;
    const twitch_channel = await fetching.get_twitch_channel(channel);
    console.log(twitch_channel.data.data[0].title);
    return twitch_channel.data.data[0].title
}

async function set_highlight(info_object) {
    let { channel, message, userstate } = info_object;
    const adapter = new FileSync('highlights.json')
    const db = low(adapter)
    // channel = 'Wilko'

    const split_msg = message.split(' ');
    const twitch_channel = await fetching.get_twitch_channel(channel);
    const user_video_list = await fetching.get_twitch_videos(twitch_channel.data.data[0].user_id);
    const highlight_id = user_video_list.data.data[0].id;
    const highlight_url = user_video_list.data.data[0].url
    const uptime_date = new Date(twitch_channel.data.data[0].started_at);
    const seconds_ago = Math.floor(((new Date() - uptime_date) / 1000));

    if (!db.has(channel).value()) {
        db.set(channel, []).write()
    }

    db.get(channel).push({
        streamer: channel,
        hl_name: message.slice(4),
        timestamp: seconds_ago,
        date: new Date(),
        hl_id: highlight_id,
        hl_url: highlight_url,
        made_by: userstate.username
    }).write()

}

async function get_highlights(info_object) {
    let { channel, message, userstate } = info_object;
    const adapter = new FileSync('highlights.json');
    const db = low(adapter);
    const all_states = db.getState()

    return all_states[channel].map(hl => hl.hl_name)
}

async function get_target_highlight(info_object) {
    let { channel, message, userstate } = info_object;
    const adapter = new FileSync('highlights.json');
    const db = low(adapter);
    const target_highlight = message.slice(7);
    const all_states = db.getState()
    const highlight_hit = all_states[channel].find(hl => hl.hl_name === target_highlight);

    return highlight_hit

}

async function delete_highlight(info_object) {
    let { channel, message, userstate } = info_object;
    const target_highlight = message.slice(5)
    const adapter = new FileSync('highlights.json');
    const db = low(adapter);
    if (target_highlight === 'all') {
        db.get(channel).remove().write()
    }
    db.get(channel)
    .remove({ hl_name: target_highlight })
    .write()
    console.log('removed: ' + target_highlight);
}

async function get_followage(info_object) {
    let { channel, message, userstate } = info_object;
    const streamer = await fetching.get_twitch_channel(channel);
    const streamer_id = streamer.data.data[0].user_id;

    const followage_info = await fetching.get_twitch_followage(streamer_id, userstate['user-id']);
    const follow_date = new Date(followage_info.data.data[0].followed_at)
    const days_ago = Math.floor(((new Date() - follow_date) / 86400000))
    // console.log(days_ago);

    return days_ago;
}

module.exports = {
    get_wr: get_wr,
    get_uptime:get_uptime,
    get_title: get_title,
    set_highlight: set_highlight,
    get_highlights: get_highlights,
    get_target_highlight: get_target_highlight,
    delete_highlight: delete_highlight,
    get_followage:get_followage
};
