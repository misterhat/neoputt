const DEFAULTS = {
    angle: 0,
    name: 'magnet',
    sprite: '/img/magnet.png',
    x: 0,
    y: 0
};

class Magnet {
    constructor(props = {}) {
        Object.keys(DEFAULTS).forEach(p => {
            this[p] = props[p] || DEFAULTS[p];
        });
    }

    toJSON() {
        const toSave = {};

        Object.keys(DEFAULTS).forEach(k => {
            toSave[k] = this[k];
        });

        delete toSave.sprite;

        return toSave;
    }
}

module.exports = Magnet;
