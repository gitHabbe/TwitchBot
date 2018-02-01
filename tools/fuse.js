const Fuse = require('fuse.js');

const set_fuse_list = (game_list) => {
    return game_list.map(game =>  ({ 'category': game.name }))
};

const get_fuse_result = (fuse_list, title) => {
    const options = {
        shouldSort: true,
        tokenize: true,
        maxPatternLength: 200,
        minMatchCharLength: 1,
        keys: ['category']
    }
    var fuse = new Fuse(fuse_list, options)
    // console.log(fuse_list);
    // console.log(title);
    const fuse_search = fuse.search(title)
    // console.log(fuse_search);
    return fuse_search
};

module.exports = {
    set_fuse_list: set_fuse_list,
    get_fuse_result: get_fuse_result
};
