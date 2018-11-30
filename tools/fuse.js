const Fuse = require('fuse.js');

const get_fuse_result = (category_list, search_term) => {
    const options = {
        shouldSort: true,
        tokenize: true,
        maxPatternLength: 200,
        minMatchCharLength: 1,
        keys: ['category']
    };
    var fuse = new Fuse(category_list, options);
    return fuse.search(search_term)[0];
};

module.exports = {
    get_fuse_result
};
