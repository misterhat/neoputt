const SAT = require('sat');
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

        this.polygon = new SAT.Box(new SAT.Vector(this.x, this.y), this.width,
            this.height).toPolygon();
        this.response = new SAT.Response();
    }

    ballCollision(ball) {
        if (SAT.testPolygonCircle(this.polygon, ball.circle, this.response)) {
            ball.wallContact(this.response.overlapV, 1.25);
            this.response.clear();
        }
    }

    toJSON() {
        const toSave = {};

        Object.keys(DEFAULTS).forEach(p => {
            toSave[p] = this[p];
        });

        delete toSave.sprite;

        return toSave;
    }
}

module.exports = Bumper;
