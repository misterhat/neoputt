const DEFAULTS = {
    angle: 0,
    name: 'magnet',
    x: 0,
    y: 0
};

class Magnet {
    constructor(props = {}) {
        Object.keys(DEFAULTS).forEach(p => {
            this[p] = props[p] || DEFAULTS[p];
        });

        this.sprite = new Image();
        this.sprite.src = '/img/magnet.png';
    }
}

module.exports = Magnet;
