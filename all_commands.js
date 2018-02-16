const low = require('lowdb')
const axios = require('axios');
const FileSync = require('lowdb/adapters/FileSync')
const fetching = require('./tools/fetching.js');
const util = require('./tools/util.js');
const tg = require('./tools/title_category.js');
const wr = require('./tools/fetch_wr.js');
const pb = require('./tools/fetch_pb.js');
const auth = require('./private/botAuth.js');
const Twitter = require('twitter');

const get_wr = async (info_object) => {
    let { channel, userstate, message, split_msg } = info_object;
    // info_object.channel = 'Wilko'
    const game_id_and_category = await tg.set_game_and_category(info_object);
    info_object.game_id = game_id_and_category.game_id;
    info_object.category_id = game_id_and_category.category_id
    info_object.fuse_hit = game_id_and_category.fuse_hit;
    const test = wr.fetch_wr(info_object);

    return test
};

const get_pb = async (info_object) => {
    let { channel, userstate, message, split_msg } = info_object;
    console.log(info_object.split_msg);
    // info_object.channel = 'Fuzzyness'
    if (split_msg.length === 1) {
        console.log('IF');
        info_object.runner = channel;
    } else {
        console.log('ELSE');
        info_object.channel = info_object.split_msg[1];
        info_object.split_msg.splice(1, 1)
        console.log(info_object.split_msg);
    }
    console.log(info_object.split_msg);
    const game_id_and_category = await tg.set_game_and_category(info_object);
    info_object.game_id = game_id_and_category.game_id;
    info_object.category_id = game_id_and_category.category_id
    info_object.fuse_hit = game_id_and_category.fuse_hit;
    console.log(info_object.game_id, info_object.category_id, info_object.fuse_hit);

    return pb.fetch_pb(info_object)
};

const new_cc = async (info_object) => {
    let { channel, message, userstate, split_msg } = info_object;
    const permission = await get_permission(info_object);
    if (!permission) {
        return 'Permission denied'
    }
    const adapter = new FileSync('custom_commands.json');
    const db = low(adapter);

    const cmd_text = split_msg.slice(2).join(' ')

    if (!db.has(channel).value()) {
        db.set(channel, []).write()
    }
    if (!split_msg[1]) {
        return 'No command-name found'
    }
    else if (cmd_text === '') {
        return 'No text to command found'
    }
    if (!db.get(channel).find({cmd_name: split_msg[1]}).value()) {
        db.get(channel).push({
            streamer: channel,
            cmd_name: split_msg[1],
            cmd_text: cmd_text,
            date: new Date(),
            made_by: userstate.username
        }).write()
        return `Command created: ${split_msg[1]}`
    } else {
        return 'Command already exists'
    }

};

const delete_cc = async (info_object) => {
    let { channel, message, userstate, split_msg } = info_object;
    const permission = await get_permission(info_object);
    if (!permission) return 'Permission denied'

    const adapter = new FileSync('custom_commands.json');
    const db = low(adapter);

    if (db.get(channel).find({ cmd_name: split_msg[1] }).value()) {
        db.get(channel).remove({ cmd_name: split_msg[1] }).write()
        return `Command ${split_msg[1]} removed`
    } else {
        return 'Cannot find command'
    }
};

const get_uptime = async (info_object) => {
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

const get_title = async (info_object) => {
    let { channel, message } = info_object;
    const twitch_channel = await fetching.get_twitch_channel(channel);
    console.log(twitch_channel.data.data[0].title);
    return twitch_channel.data.data[0].title
};

const set_highlight = async (info_object) => {
    let { channel, message, userstate } = info_object;
    const permission = await get_permission(info_object);
    if (!permission) return 'Permission denied'

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
    if (!db.get(channel).find({hl_name: message.slice(4)}).value()) {
        db.get(channel).push({
            streamer: channel,
            hl_name: message.slice(4),
            timestamp: seconds_ago,
            date: new Date(),
            hl_id: highlight_id,
            hl_url: highlight_url,
            made_by: userstate.username
        }).write()
        return `Highlight created: ${message.slice(4)}`
    } else {
        return 'Highlight already exists'
    }

};

const get_highlights = async (info_object) => {
    let { channel, message, userstate } = info_object;
    const adapter = new FileSync('highlights.json');
    const db = low(adapter);
    const all_states = db.getState()

    return all_states[channel].map(hl => hl.hl_name)
};

const get_target_highlight = async (info_object) => {
    let { channel, message, userstate } = info_object;
    const adapter = new FileSync('highlights.json');
    const db = low(adapter);
    const target_highlight = message.slice(7);
    const all_states = db.getState()
    const highlight_hit = all_states[channel].find(hl => hl.hl_name === target_highlight);

    return highlight_hit

};

const delete_highlight = async (info_object) => {
    let { channel, message, userstate } = info_object;
    const permission = await get_permission(info_object);
    if (!permission) return 'Permission denied'

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
};

const get_followage = async (info_object) => {
    let { channel, message, userstate } = info_object;
    
    const streamer = await fetching.get_twitch_channel(channel);
    const streamer_id = streamer.data.data[0].user_id;
    const followage_info = await fetching.get_twitch_followage(streamer_id, userstate['user-id']);
    console.log(followage_info.data)
    if (followage_info.data.data.length >= 1) {
        const follow_date = new Date(followage_info.data.data[0].followed_at)
        const days_ago = Math.floor(((new Date() - follow_date) / 86400000))
    
        return days_ago;
        
    }
    return -1
};

const get_youtube_info = async (info_object, short = false) => {
    let { channel, message, userstate, split_msg } = info_object;
    let re = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)[\w\=]*)?/;
    let yt_link;
    if (short) {
        yt_link = split_msg.find(word => word.indexOf('https://youtu.be') !== -1)
    } else {
        yt_link = split_msg.find(word => word.indexOf('https://www.youtube.com') !== -1)
    }
    const yt_id = re.exec(yt_link)[1]
    const yt_video = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${yt_id}&key=${auth.ytauth.apikey}
        &part=snippet,contentDetails,statistics,status`)
    const {viewCount, likeCount, dislikeCount} = yt_video.data.items[0].statistics;
    const likePercent = Math.round((parseInt(likeCount) / (parseInt(likeCount) + parseInt(dislikeCount))) * 100)
    const title = yt_video.data.items[0].snippet.title;
    re = /[A-Z][A-Z](\d*H+)*(\d*M+)*(\d*S)/;
    const duration = yt_video.data.items[0].contentDetails.duration;
    console.log(duration)
    let grouped_dur = re.exec(duration).slice(1, 4);
    console.log(grouped_dur)
    grouped_dur = grouped_dur.map(time => {
        if (time) {
            if (time.length === 2) {
                return '0' + time.slice(0, -1) + ':';
            } else {
                return time.slice(0, -1) + ':';
            }
        }
    })
    grouped_dur = grouped_dur.filter(num => num !== undefined)
    grouped_dur = grouped_dur.join('').slice(0, -1)

    return `[${grouped_dur}, ${viewCount} views, ${likePercent}% likes] ${title}`
};

const get_tweet_info = async (info_object) => {
    let { channel, message, userstate, split_msg } = info_object;
    var client = new Twitter({
        consumer_key: auth.twauth.apikey,
        consumer_secret: auth.twauth.apisecret,
        access_token_key: auth.twauth.token,
        access_token_secret: auth.twauth.tokensecret
    });
    let re = /http(?:s?):\/\/(?:www\.)?twitter(?:\.com\/)([\w]*)\/status\/(\d*)?/;
    let tw_link = split_msg.find(word => word.indexOf('twitter.com/') !== -1)
    let re_groups = re.exec(tw_link).slice(1, 3);
    const tw_fetch = await client.get('statuses/show', {id: re_groups[1]})
    const verified = tw_fetch.user.verified ? '☑️' : ''
    console.log(re_groups)
    return `[${tw_fetch.user.name}@${tw_fetch.user.screen_name}${verified}] ${tw_fetch.text}`
};

const add_permission = async (info_object) => {
    let { channel, message, userstate, split_msg } = info_object;
    const permission = await get_permission(info_object);
    if (!permission) return 'Permission denied'
    if (!split_msg[1]) return 'No user specified'

    const adapter = new FileSync('permission.json')
    const db = low(adapter)
    if (!db.has(channel).value()) {
        db.set(channel, []).write()
    }
    if (!db.get(channel).find({name: split_msg[1]}).value()) {
        db.get(channel).push({
            name: split_msg[1],
            date: new Date(),
            made_by: userstate.username
        }).write()
    }
    return `${split_msg[1]} added to permission list`

};

const list_permission = async (info_object) => {
    let { channel, message, userstate, split_msg } = info_object;
    const adapter = new FileSync('permission.json')
    const db = low(adapter)

    const perm_list = db.get(channel).value().map(user => user.name)
    if (perm_list.length === 0) {
        return {names_string: 'Emtpy list', perm_list: perm_list}
    }
    return {names_string: perm_list.join(' '), perm_list: perm_list}
};

const get_permission = async (info_object) => {
    let { channel, message, userstate, split_msg } = info_object;
    let { perm_list } = await list_permission(info_object)
    console.log(perm_list)
    if (userstate.username === channel) {
        console.log(1)
        return true
    } else if (userstate.username.mod) {
        console.log(2)
        return true
    } else if (perm_list && perm_list.includes(userstate.username)) {
        console.log(3)
        return true
    } else {
        const followage = await get_followage(info_object)
        console.log(followage)
        let two_years = 730
        if (parseInt(followage) >= two_years) {
            console.log(4)
            return true
        }
        return false
    }
};

module.exports = {
    get_wr,
    get_pb,
    get_uptime,
    get_title,
    set_highlight,
    get_highlights,
    get_target_highlight,
    delete_highlight,
    get_followage,
    new_cc,
    delete_cc,
    get_youtube_info,
    get_tweet_info,
    add_permission,
    list_permission
};
