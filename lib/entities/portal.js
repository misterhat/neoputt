const config = require('../../config');

const DEFAULTS = {
    colour: 'red',
    height: config.tileSize,
    name: 'portal',
    width: config.tileSize,
    x: 0,
    y: 0
};

class Portal {
    constructor(props = {}) {
        Object.keys(DEFAULTS).forEach(p => {
            this[p] = props[p] || DEFAULTS[p];
        });
    }
}

module.exports = Portal;
