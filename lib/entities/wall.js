const SAT = require('sat');
const config = require('../../config');

const DEFAULTS = {
    absorb: 0.75,
    height: config.tileSize,
    name: 'wall',
    sprite: '/img/brick.png',
    width: config.tileSize,
    x: 0,
    y: 0
};
const SAVE = [ 'name', 'x', 'y' ];

class Wall {
    constructor(props = {}) {
        Object.keys(DEFAULTS).forEach(p => {
            this[p] = props[p] || DEFAULTS[p];
        });

        this.polygon = new SAT.Box(new SAT.Vector(this.x, this.y), this.width,
            this.height).toPolygon();
        this.response = new SAT.Response();
    }

    ballCollision(ball) {
        const oldSpeed = ball.getSpeed();

        if (SAT.testPolygonCircle(this.polygon, ball.circle, this.response)) {
            ball.wallContact(this.response.overlapV, this.absorb);
            this.response.clear();

            return oldSpeed;
        }
    }

    toJSON() {
        const toSave = {};
        SAVE.forEach(p => toSave[p] = this[p]);

        return toSave;
    }
}

module.exports = Wall;
