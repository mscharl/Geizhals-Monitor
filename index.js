const config = require('./config.json');
const Monitor = require('./classes/Monitor.js');

const monitors = config.lists.map((list) => new Monitor(list));
