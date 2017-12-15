const axios = require('axios');

const get_wr = axios.get('https://www.speedrun.com/api/v1/leaderboards/9dow9e1p/category/q25qqv2o')
.then(data => {
    console.log(data.data.data.runs[0].run.times.primary_t);
    client.say('habbe', `WR is: ${data.data.data.runs[0].run.times.primary_t}`)
}).catch(err => {
    console.log(err)
});

module.exports = {
    get_wr: get_wr
}
