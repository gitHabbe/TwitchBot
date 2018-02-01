function secondsToString(seconds)
{
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

module.exports = {
    secondsToString: secondsToString
}
