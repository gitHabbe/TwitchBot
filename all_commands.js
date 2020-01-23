const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const axios = require("axios");
const Twitter = require("twitter");
const fs = require("fs");

const fuse = require("./tools/fuse.js");
const fetching = require("./tools/fetching.js");
const util = require("./tools/util.js");
const tg = require("./tools/title_category.js");
const wr = require("./tools/fetch_wr.js");
const pb = require("./tools/fetch_pb.js");

const get_wr = async info_object => {
    const { game_id, category_id, category } = await tg.set_game_and_category(info_object);
    info_object.game_id = game_id;
    info_object.category_id = category_id;
    info_object.category = category;

    return wr.fetch_wr(info_object);
};

const get_pb = async info_object => {
    let { channel, split_msg } = info_object;
    if (split_msg.length === 1) {
        info_object.runner = channel;
    } else {
        info_object.runner = info_object.split_msg[1];
        info_object.split_msg.splice(1, 1);
        console.log("LOG: info_object.split_msg", info_object.split_msg);
        // console.log("LOG: info_object.split_msg", info_object.split_msg);
    }
    const { game_id, category_id, category } = await tg.set_game_and_category(info_object);
    console.log("LOG: game_id, category_id, category", game_id, category_id, category);
    info_object.game_id = game_id;
    info_object.category_id = category_id;
    info_object.category = category;
    // return "1";

    return pb.fetch_pb(info_object);
};

const get_il_wr = async info_object => {
    let { channel, userstate, message, split_msg } = info_object;
    const game = await tg.get_game_id(info_object);
    const level_list = await fetching.fetch_game_levels(game.game_id);
    const level_list_names = level_list.data.data.map((level, index) => {
        let level_name = level.name;
        // console.log(level_name)
        if (level_name.indexOf("(") > -1) {
            level_name = level_name.replace("(", "");
            level_name = level_name.replace(")", "");
        }
        const lb_uri = level.links.find(link => link.rel === "leaderboard");
        return { category: level_name, lb_uri: lb_uri.uri, index: index };
    });
    // console.log('level_list_names: ', level_list_names);
    const fuse_hit = fuse.get_fuse_result(level_list_names, split_msg.slice(2).join(" "));
    const level_lb = await fetching.fetch_speedrun_uri(fuse_hit.lb_uri + "?top=1");
    const wr_time = util.millisecondsToString(level_lb.data.data.runs[0].run.times.primary_t);
    const speedrunner = await fetching.fetch_speedrun_uri(level_lb.data.data.runs[0].run.players[0].uri);
    const days_ago = Math.floor((new Date() - new Date(level_lb.data.data.runs[0].run.date)) / 86400000);

    return `${level_list.data.data[fuse_hit.index].name} WR: ${wr_time} \
by ${speedrunner.data.data.names.international} \
${days_ago} days ago`;
};

const get_il_pb = async info_object => {
    console.log("testasdsa");

    let { channel, userstate, message, split_msg } = info_object;

    runner_msg = split_msg[1];
    info_object.split_msg.splice(1, 1);
    let speedrunner_list = await fetching.get_speedrunner(runner_msg);
    // console.log('speedrunner_list.data: ', speedrunner_list.data);
    speedrunner = speedrunner_list.data.data.find(
        runner => runner.names.international.toLowerCase() === runner_msg.toLowerCase()
    );
    // console.log('speedrunner ', speedrunner);

    console.log("info_object.split_msg: ", info_object.split_msg);
    const game = await tg.get_game_id(info_object);
    const level_list = await fetching.fetch_game_levels(game.game_id);
    const level_list_names = level_list.data.data.map((level, index) => {
        let level_name = level.name;
        // console.log(level_name)
        if (level_name.indexOf("(") > -1) {
            level_name = level_name.replace("(", "");
            level_name = level_name.replace(")", "");
        }
        const lb_uri = level.links.find(link => link.rel === "leaderboard");
        return { category: level_name, lb_uri: lb_uri.uri, index: index };
    });
    const fuse_hit = fuse.get_fuse_result(level_list_names, split_msg.slice(2).join(" "));
    console.log("fuse_hit: ", fuse_hit);
    const level_lb = await fetching.fetch_speedrun_uri(fuse_hit.lb_uri);
    const run = level_lb.data.data.runs.find(run => {
        return run.run.players[0].id === speedrunner.id;
    });
    console.log("run: ", run);
    const player_time = util.millisecondsToString(run.run.times.primary_t);
    return `${speedrunner.names.international}'s ${fuse_hit.category} PB is ${player_time}. Place: ${run.place}`;
    console.log("run: ", run);
};

const new_cc = async info_object => {
    let { channel, message, userstate, split_msg } = info_object;
    const permission = await is_permissioned(info_object);
    if (!permission) return "Permission denied";
    if (!split_msg[1]) return "No command-name specified.";
    if (!split_msg[2]) return "No command-content specified.";

    const adapterw = new FileSync("./reserved-words.json");
    const dbw = low(adapterw);
    const is_reserved = dbw
        .get("words")
        .value()
        .find(word => word === split_msg[1]);
    if (is_reserved) return split_msg[1] + " is a reserved command.";

    const content = split_msg.slice(2).join(" ");

    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);

    const userDB = db.get("users").find({ name: channel });
    const is_taken = userDB
        .get("commands")
        .value()
        .find(cmd => cmd.name === split_msg[1]);
    if (is_taken) return "Command already exists.";
    userDB
        .get("commands")
        .push({
            name: split_msg[1],
            content: content,
            made_by: userstate.username,
            date: new Date()
        })
        .write();

    return "Command created: " + split_msg[1];
};

const check_cc = async info_object => {
    let { channel, message, userstate, split_msg } = info_object;

    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);

    const userDB = db.get("users").find({ name: channel });
    const is_used = userDB
        .get("commands")
        .find({ name: split_msg[1] })
        .value();
    if (!is_used) return "Command not found.";

    return is_used.content;
};

const delete_cc = async info_object => {
    let { channel, message, userstate, split_msg } = info_object;
    const permission = await is_permissioned(info_object);
    if (!permission) return "Permission denied";

    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    const userDB = db.get("users").find({ name: channel });

    const is_cmd = userDB
        .get("commands")
        .find({ name: split_msg[1] })
        .value();

    if (!is_cmd) return split_msg[1] + " is not a command.";

    userDB
        .get("commands")
        .remove({ name: split_msg[1] })
        .write();

    return split_msg[1] + " deleted.";
};

const get_uptime = async info_object => {
    let { channel, message } = info_object;
    const twitch_channel = await fetching.get_twitch_channel(channel);
    if (twitch_channel.data.data.length === 0) return channel + " is not online.";
    const uptime_date = new Date(twitch_channel.data.data[0].started_at);
    const seconds_ago = Math.floor((new Date() - uptime_date) / 1000);
    const time_string = util.secondsToString(seconds_ago);

    return time_string;
};

const get_title = async info_object => {
    let { channel, message } = info_object;
    const twitch_channel = await fetching.get_twitch_channel(channel);
    if (twitch_channel.data.data.length === 0) return channel + " is not online.";

    return twitch_channel.data.data[0].title;
};

const set_highlight = async info_object => {
    let { channel, message, userstate, split_msg } = info_object;
    const permission = await is_permissioned(info_object);
    if (!permission) return "Permission denied";
    if (message.slice(4).toLowerCase() === "all") return '"all" is a reserved name.';

    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    const userDB = db
        .get("users")
        .find({ name: channel })
        .get("highlights");
    const is_taken = userDB.find({ hl_name: message.slice(4) }).value();
    if (is_taken) return "Highlight-name already exists.";
    // channel = "lezonta";
    const twitch_channel = await fetching.get_twitch_channel(channel);
    const user_video_list = await fetching.get_twitch_videos(twitch_channel.data.data[0].user_id);
    const highlight_id = user_video_list.data.data[0].id;
    const highlight_url = user_video_list.data.data[0].url;
    const uptime_date = new Date(twitch_channel.data.data[0].started_at);
    const seconds_ago = Math.floor((new Date() - uptime_date) / 1000);

    userDB
        .push({
            hl_name: message.slice(4),
            hl_url: highlight_url,
            made_by: userstate.username,
            timestamp: seconds_ago,
            hl_id: highlight_id,
            date: new Date()
        })
        .write();

    return `Highlight created: ${message.slice(4)}`;
};

const get_highlights = async info_object => {
    let { channel, message, userstate } = info_object;
    const permission = await is_permissioned(info_object);
    if (!permission) return "Permission denied";
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    const hl_list = db
        .get("users")
        .find({ name: channel })
        .get("highlights")
        .value();

    if (hl_list.length === 0) return "No highlights created.";

    return hl_list.map(hl => hl.hl_name).join(", ");
};

const get_target_highlight = async info_object => {
    let { channel, message, userstate } = info_object;
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    const target_highlight = message.slice(7);
    const hl_list = db
        .get("users")
        .find({ name: channel })
        .get("highlights")
        .value();
    const highlight_hit = hl_list.find(hl => hl.hl_name === target_highlight);
    if (!highlight_hit) return "Highlight not found.";

    const timestamp = util.secondsToString(highlight_hit.timestamp - 100).replace(/\s/g, "");

    return highlight_hit.hl_name + ", " + highlight_hit.hl_url + "?t=" + timestamp;
};

const delete_highlight = async info_object => {
    let { channel, message } = info_object;
    const permission = await is_permissioned(info_object);
    if (!permission) return "Permission denied";

    const target_highlight = message.slice(5);
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    const hl_list = db
        .get("users")
        .find({ name: channel })
        .get("highlights");

    console.log("LOG: target_highlight", target_highlight);
    if (target_highlight === "all") {
        db.get("users")
            .find({ name: channel })
            .set("highlights", [])
            .write();
        return "All highlights deleted.";
    }
    const target_hl = hl_list.find({ hl_name: target_highlight }).value();
    if (!target_hl) return "Highlight not found.";
    hl_list.remove({ hl_name: target_highlight }).write();
    return target_highlight + " deleted.";
};

const get_followage = async info_object => {
    let { channel, userstate } = info_object;
    const streamer = await fetching.get_twitch_channel(channel);
    if (streamer.data.data.length === 0) return "Streamer offline. Can't find followage.";
    const streamer_id = streamer.data.data[0].user_id;

    let followage_info = await fetching.get_twitch_followage(streamer_id, userstate["user-id"]);
    followage_info = followage_info.data.data;
    if (followage_info.length === 0) return userstate.username + " is not following " + channel;
    const follow_date = new Date(followage_info.followed_at);
    const days_ago = Math.floor((new Date() - follow_date) / 86400000);

    return userstate.username + " followage: " + days_ago + " days";
};

const get_youtube_info = async (info_object, short = false) => {
    let { channel, message, userstate, split_msg } = info_object;
    let re = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)[\w\=]*)?/;
    let yt_link;
    if (short) {
        yt_link = split_msg.find(word => word.indexOf("https://youtu.be") !== -1);
    } else {
        yt_link = split_msg.find(word => word.indexOf("https://www.youtube.com") !== -1);
    }
    const yt_id = re.exec(yt_link)[1];
    console.log(yt_id);
    const yt_video = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${yt_id}&key=${process.env.YT_API_KEY}&part=snippet,contentDetails,statistics,status`
    );
    const { viewCount, likeCount, dislikeCount } = yt_video.data.items[0].statistics;
    const likePercent = Math.round((parseInt(likeCount) / (parseInt(likeCount) + parseInt(dislikeCount))) * 100);
    const title = yt_video.data.items[0].snippet.title;
    re = /[A-Z][A-Z](\d*H+)*(\d*M+)*(\d*S)/;
    const duration = yt_video.data.items[0].contentDetails.duration;
    console.log(duration);
    let grouped_dur = re.exec(duration).slice(1, 4);
    console.log(grouped_dur);
    grouped_dur = grouped_dur.map(time => {
        if (time) {
            if (time.length === 2) {
                return "0" + time.slice(0, -1) + ":";
            } else {
                return time.slice(0, -1) + ":";
            }
        }
    });
    grouped_dur = grouped_dur.filter(num => num !== undefined);
    grouped_dur = grouped_dur.join("").slice(0, -1);

    return `[${grouped_dur}, ${viewCount} views, ${likePercent}% likes] ${title}`;
};

const get_tweet_info = async info_object => {
    let { channel, message, userstate, split_msg } = info_object;
    var client = new Twitter({
        consumer_key: process.env.TWITTER_API_KEY,
        consumer_secret: process.env.TWITTER_API_SECRET,
        access_token_key: process.env.TWITTER_TOKEN,
        access_token_secret: process.env.TWITTER_TOKEN_SECRET
    });
    let re = /http(?:s?):\/\/(?:www\.)?twitter(?:\.com\/)([\w]*)\/status\/(\d*)?/;
    let tw_link = split_msg.find(word => word.indexOf("twitter.com/") !== -1);
    let re_groups = re.exec(tw_link).slice(1, 3);
    const tw_fetch = await client.get("statuses/show", { id: re_groups[1] });
    const verified = tw_fetch.user.verified ? "☑️" : "";
    console.log(re_groups);
    return `[${tw_fetch.user.name}@${tw_fetch.user.screen_name}${verified}] ${tw_fetch.text}`;
};

const add_permission = async info_object => {
    let { channel, userstate, split_msg } = info_object;
    const permission = await is_permissioned(info_object);
    if (!permission) return "Permission denied";
    if (!split_msg[1]) return "No user specified";

    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    const userDB = db.get("users").find({ name: channel });
    const is_listed = userDB.value().permission.find(user => user.name === split_msg[1]);

    if (is_listed) return `${split_msg[1]} is already on the list`;

    userDB
        .get("permission")
        .push({
            name: split_msg[1],
            date: new Date(),
            made_by: userstate.username
        })
        .write();

    return `${split_msg[1]} added to permission list`;
};

const remove_permission = async info_object => {
    let { channel, userstate, split_msg } = info_object;
    if (channel !== userstate.username) return "Only streamer can remove permissions.";
    if (!split_msg[1]) return "No user specified";

    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);

    const userDB = db.get("users").find({ name: channel });
    const is_listed = userDB.value().permission.find(user => user.name === split_msg[1]);
    if (!is_listed) return split_msg[1] + " not on list";
    userDB
        .get("permission")
        .remove({ name: split_msg[1] })
        .write();

    return split_msg[1] + " has been removed from list.";
};

const list_permission = async info_object => {
    let { channel } = info_object;
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    let dbUser = db
        .get("users")
        .find({ name: channel })
        .value();

    return dbUser.permission;
};

const list_permission_string = async info_object => {
    const users = await list_permission(info_object);
    if (users.length === 0) {
        return "Empty list";
    }
    return users.map(user => user.name).join(", ");
};

const is_permissioned = async info_object => {
    let { channel, userstate } = info_object;
    const perm_list = await list_permission(info_object);
    const is_listed = perm_list.find(user => user.name === userstate.username);
    console.log("perm_list: ", perm_list);
    if (is_listed) {
        return true;
    } else if (userstate.username === channel) {
        return true;
    } else if (userstate.mod) {
        return true;
    }

    return false;
};

const get_timezone = async info_object => {
    let { split_msg } = info_object;
    const res = await axios.get(
        "http://api.timezonedb.com/v2/convert-time-zone?key=" +
            process.env.TMZDB_API_KEY +
            "&to=America/New_York&from=Europe/Stockholm&format=json"
    );
    console.log(parseInt(res.data.fromTimestamp) - parseInt(res.data.toTimestamp));
    const [msg_hour, msg_minute] = split_msg[1].split(":");
    console.log(msg_hour, msg_minute);
    console.log(res.data);
    const new_hour = (parseInt(res.data.fromTimestamp) - parseInt(res.data.toTimestamp)) / 3600;
    // const new_time = parseInt(split_msg[1]) - parseInt(hour_difference)
    // console.log(new_time)
    // return new_time + ' ' + res.data.toAbbreviation;
    // let m = moment('2018-02-21T00:45:00.000Z').tz('America/New_York');
    // let usTimeFormat = 'hh:mm:ss a';
    // console.log(m.format(usTimeFormat));
};

const join_channel = async (info_object, client) => {
    let { channel, userstate, split_msg } = info_object;
    if (channel != "habbe2") return;

    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    db.defaults({ users: [] }).write();
    const channel_list = JSON.parse(fs.readFileSync("./private/channels.json", "utf8"));

    if (userstate.username === "habbe" && split_msg[1]) userstate.username = split_msg[1];
    const isJoined = channel_list.find(name => name === userstate.username);

    if (isJoined) return "I'm already in your channel.";

    channel_list.push(userstate.username);
    fs.writeFileSync("./private/channels.json", JSON.stringify(channel_list));
    db.get("users")
        .push({ name: userstate.username, settings: {}, highlights: [], commands: [], components: [], permission: [] })
        .write();

    client
        .join(userstate.username)
        .then(data => {
            console.log("LOG: data", data);
        })
        .catch(function(err) {
            console.log("LOG: err", err);
        });

    return "I have joined your channel, use !help to my commands.";
};

const leave_channel = async (info_object, client) => {
    let { channel, userstate, split_msg } = info_object;
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    let channel_list = JSON.parse(fs.readFileSync("./private/channels.json", "utf8"));
    if (userstate.username === "habbe" && split_msg[1]) userstate.username = split_msg[1];
    const isJoined = channel_list.find(name => name === userstate.username);

    if (channel === "habbe2" && !isJoined) return "I'm not in your channel.";
    if (userstate.username !== channel && channel !== "habbe2") return "Permission denied.";

    channel_list = channel_list.filter(name => name !== userstate.username);
    fs.writeFileSync("./private/channels.json", JSON.stringify(channel_list));
    db.get("users")
        .remove({ name: userstate.username })
        .write();
    client.part(userstate.username);

    return "I have left your channel.";
};

const enable_component = async info_object => {
    let { channel, message, userstate, split_msg } = info_object;

    let component = split_msg[1];
    if (component.indexOf("!") >= 0) component = component.replace("!", "");
    console.log("component: ", component);
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);

    if (!db.get(channel + ".user-settings." + component).value()) {
        db.set(channel + ".user-settings." + component, true).write();
        return "!" + component + " is now enabled.";
    }
    return "!" + component + " already enabled.";
};

const disable_component = async info_object => {
    let { channel, message, userstate, split_msg } = info_object;

    let component = split_msg[1];
    if (component.indexOf("!") >= 0) component = component.replace("!", "");
    console.log("component: ", component);

    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);

    if (db.get(channel + ".user-settings." + component).value()) {
        db.set(channel + ".user-settings." + component, false).write();
        return "!" + component + " is now disabled.";
    }
    return "!" + component + " already disabled.";
};

const slots = async info_object => {
    let { userstate } = info_object;

    var emotes = ["Kappa", "Jebaited", "MingLee", "DansGame", "PogChamp", "Kreygasm"];
    var rolls = [];

    // const adapter = new FileSync("./private/database.json");
    // const db = low(adapter);

    // if (db.get(channel + ".user-settings.slots").value() === false) {
    //     return "Slots not enabled in this channel.";
    // }

    for (var i = 0; i < 3; i++) {
        var randomNr = Math.floor(Math.random() * emotes.length);
        rolls.push(randomNr);
    }
    var sentence = "";
    for (var i = 0; i < rolls.length; i++) {
        sentence += emotes[rolls[i]] + " | ";
    }

    sentence = sentence.slice(0, -2);

    if (rolls[0] === rolls[1] && rolls[1] === rolls[2]) sentence += " ---> " + userstate["display-name"] + " Legend!";

    return sentence;
};

const help_command = async info_object => {
    let { channel, message, userstate, split_msg } = info_object;

    if (!split_msg[1]) {
        return (
            'Use "!help [!Option]". Options: ' +
            "enable, disable, newcmd, delcmd, hl, hls, gethl, " +
            "dhl, wr, pb, ilwr, ilpb, addperm, getperm, " +
            "title, uptime, leave"
        );
    }

    split_msg[1] = split_msg[1].replace(/!/g, "");
    switch (split_msg[1]) {
        case "enable":
            return "Use !enable [component] to enable a component.";
        case "disable":
            return "Use !disable [component] to disable a component.";
        case "newcmd":
            return "Use !newcmd [command-name] [command-text] to create a custom command. (!addcmd also works)";
        case "delcmd":
            return "Use !delcmd [command-name] to delete a custom command. !deletecmd and !removecmd also works.";
        case "hl":
            return "Use !hl [highlight-name] to create a highlight timestamp.";
        case "hls":
            return "Use !hls to list all your highlight-names.";
        case "dhl":
            return "Use !dhl [highlight-name] to delete a highlight.";
        case "addperm":
            return "Use !addperm [name] to give a person permission to manage highlights/customcommands/permissions.";
        case "getperm":
            return "Use !getperm to list all people with extra permission.";
        case "title":
            return "Displays your current title.";
        case "uptime":
            return "Shows how long your stream has been live.";
        case "wr":
            return (
                "Use !wr [game] [category] to get world record time. Leave [category] empty to get category from title. " +
                "Leave [game] empty to get game from current game being played."
            );
        case "ilwr":
            return "Use !ilwr [game] [level] [vehicle] to get world record time. Currently only works for Diddy Kong Racing.";
        case "pb":
            return (
                "Use !pb [player-name] [game] [category] to get personal best time. Leave [category] empty to get category from title. " +
                "Leave [game] empty to get game from current game being played."
            );
        case "ilpb":
            return "Use !ilpb [player] [game] [level] [vehicle] to get personal best time. Currently only works for Diddy Kong Racing.";
        case "leave":
            return "Make me leave your channel. !part also works.";
        default:
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
    remove_permission,
    list_permission,
    list_permission_string,
    get_timezone,
    join_channel,
    leave_channel,
    get_il_wr,
    get_il_pb,
    check_cc,
    enable_component,
    disable_component,
    slots,
    help_command
};
