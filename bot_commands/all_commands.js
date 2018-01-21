const wr_command = require('./wr.js');
// const msg_category = split_msg[2] || '';
// const msg_game = split_msg.length > 1 ? split_msg[1]: '';
// const msg_category = split_msg.length > 2 ? split_msg[2]: '';

const get_wr = (info_object) => {

    let { channel, userstate, message } = info_object;

    const split_msg = message.split(' ');

    const msg_game = split_msg.length > 1 && split_msg[1];
    const msg_category = split_msg.length > 2 && split_msg[2];

    if (msg_game && msg_category) {
        info_object.msg_game = msg_game;
        info_object.msg_category = msg_category;
        return wr_command.check_game_id(info_object);
    } else if (msg_game) {
        info_object.msg_game = msg_game;
        return wr_command.check_game_id(info_object);
    } else if (msg_category) {
        info_object.msg_category = msg_category;
        return wr_command.check_game_id(info_object);
    } else {
        console.log('No game specified, grabbing title');
        return wr_command.check_game_id(info_object);
    }
};

module.exports = {
    get_wr: get_wr
};
