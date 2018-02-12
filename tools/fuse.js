const Fuse = require('fuse.js');

const set_fuse_list = (game_list) => {
    return game_list.filter(game => {
        // console.log(game.links);
        if (game.links.find(link => link.rel === 'leaderboard')) {
            return game
        }
    }).map(game => {
        // console.log(game.links);
        return {
            'category': game.name,
            'category_id': game.id
        }
    })
};

const get_fuse_result = (fuse_list, title) => {
    const options = {
        shouldSort: true,
        tokenize: true,
        maxPatternLength: 200,
        minMatchCharLength: 1,
        keys: ['category']
    }
    // console.log(fuse_list);
    var fuse = new Fuse(fuse_list, options)
    return fuse.search(title)[0]
};

module.exports = {
    set_fuse_list: set_fuse_list,
    get_fuse_result: get_fuse_result
};
