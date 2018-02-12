function secondsToString(seconds) {
    let str = ''
    let years = Math.floor(seconds / 31536000);
    if (years > 0) str += years + 'y '
    let days = Math.floor((seconds % 31536000) / 86400);
    if (days > 0) str += days + 'd '
    let hours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    if (hours > 0) str += hours + 'h '
    let mins = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    if (mins > 0) str += mins + 'm '
    let secs = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60);
    if (secs > 0) str += secs + 's'
    return str.trim()
}

const get_game_link = (object, rel_name) => {
    // return object.links.find(link => link.rel === rel_name).uri;
    return object.links.find(link => {
        // console.log(link.rel);
        return link.rel === rel_name
    }).uri;
};

const get_correct_category = (category_list, title) => {
    // console.log('TITLE: ' + title.toLowerCase());
    let found_category = category_list.find(category => {
        // console.log('CATEGORY: ' + category.name.toLowerCase());
        return title.toLowerCase().includes(category.name.toLowerCase())
    })
    // console.log(found_category);
    return { uri: get_game_link(found_category, 'leaderboard'), name: found_category.name }
};

module.exports = {
    get_game_link: get_game_link,
    get_correct_category: get_correct_category,
    secondsToString: secondsToString
}
