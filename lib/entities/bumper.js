const config = require('../../config');

const DEFAULTS = {
    height: config.tileSize,
    name: 'bumper',
    sprite: '/img/bumper.png',
    width: config.tileSize,
    x: 0,
    y: 0
};

class Bumper {
    constructor(props = {}) {
        Object.keys(DEFAULTS).forEach(p => {
            this[p] = props[p] || DEFAULTS[p];
        });
    }
}

module.exports = Bumper;
