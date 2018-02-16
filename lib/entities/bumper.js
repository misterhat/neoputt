const Wall = require('./wall');

const DEFAULTS = {
    absorb: 1.25, // TODO increase this when we increase FPS
    name: 'bumper',
    sprite: '/img/bumper.png'
};

class Bumper extends Wall {
    constructor(props = {}) {
        super(props);
        Object.keys(DEFAULTS).forEach(p => this[p] = DEFAULTS[p]);
    }
}

module.exports = Bumper;
