function secondsToString(seconds) {
    let str = "";
    let days = Math.floor((seconds % 31536000) / 86400);
    if (days > 0) str += days + "d ";
    let hours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    if (hours > 0) str += hours + "h ";
    let mins = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    if (mins > 0) str += mins + "m ";
    let secs = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60);
    if (secs > 0) str += secs + "s";
    return str.trim();
}

function secondsToString2(seconds) {
    let str = "";
    let days = Math.floor((seconds % 31536000) / 86400);
    if (days > 0) str += days + "d ";
    let hours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    if (hours > 0) {
        if (hours < 10) {
            str += "0" + hours + ":";
        } else {
            str += hours + ":";
        }
    }
    let mins = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    if (mins > 0) {
        if (mins < 10) {
            str += "0" + mins + ":";
        } else {
            str += mins + ":";
        }
    }
    let secs = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60);
    if (secs > 0) {
        if (hours < 0 && minutes < 0) {
            str += secs + "s";
        } else if (secs < 10) {
            str += "0" + secs;
        } else {
            str += secs + "";
        }
    }
    return str.trim();
}

function millisecondsToString(time) {
    let str = "";
    let hours = Math.floor(((time % 31536000) % 86400) % 3600);
    let mins = Math.floor((((time % 31536000) % 86400) % 3600) / 60);
    if (mins > 0) {
        if (mins < 10) {
            str += "0" + mins + ":";
        } else {
            str += mins + ":";
        }
    }
    let secs = Math.floor((((time % 31536000) % 86400) % 3600) % 60);
    if (secs > 0) {
        if (secs < 10) {
            str += "0" + secs;
        } else {
            str += secs;
        }
    }

    let milli = String(time).split(".");
    return str + "." + milli[1];
}

const secondsToString3 = time => {
    let str = "";
    let mins = Math.floor((((time % 31536000) % 86400) % 3600) / 60);
    if (mins > 0) {
        str += mins + ":";
    }
    let secs = Math.floor((((time % 31536000) % 86400) % 3600) % 60);
    if (secs > 0) {
        if (secs < 10) {
            str += "0" + secs;
        } else {
            str += secs;
        }
    }
    let hundreth = time.toString().split(".")[1];
    str += "." + hundreth;

    return str;
};

const get_game_link = (object, rel_name) => {
    // return object.links.find(link => link.rel === rel_name).uri;
    return object.links.find(link => {
        // console.log(link.rel);
        return link.rel === rel_name;
    }).uri;
};

const get_correct_category = (category_list, title) => {
    // console.log('TITLE: ' + title.toLowerCase());
    let found_category = category_list.find(category => {
        // console.log('CATEGORY: ' + category.name.toLowerCase());
        return title.toLowerCase().includes(category.name.toLowerCase());
    });
    // console.log(found_category);
    return { uri: get_game_link(found_category, "leaderboard"), name: found_category.name };
};

module.exports = {
    get_game_link: get_game_link,
    get_correct_category: get_correct_category,
    secondsToString: secondsToString,
    secondsToString2: secondsToString2,
    millisecondsToString: millisecondsToString,
    secondsToString3
};
