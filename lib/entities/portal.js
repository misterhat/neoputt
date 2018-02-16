const SAT = require('sat');
const config = require('../../config');

const DEFAULTS = {
    colour: 'red',
    height: config.tileSize,
    name: 'portal',
    toX: -1,
    toY: -1,
    width: config.tileSize,
    x: 0,
    y: 0
};
const SAVE = [ 'colour', 'name', 'toX', 'toY', 'x', 'y' ];

class Portal {
    constructor(props = {}) {
        Object.keys(DEFAULTS).forEach(p => {
            this[p] = props[p] || DEFAULTS[p];
        });

        this.point = new SAT.Vector(this.x + 8, this.y + 8);
    }

    ballCollision(ball) {
        if (this.toX === -1 || this.toY === -1) {
            return false;
        }

        if (!SAT.pointInCircle(this.point, ball.circle)) {
            return false;
        }

        if (ball.fromPortal === 0) {
            ball.fromPortal = (config.tileSize / 2);
            ball.sinking = true;
            ball.toX = this.toX;
            ball.toY = this.toY;

            return 0.3;
        }
    }

    toJSON() {
        const toSave = {};
        Object.keys(DEFAULTS).forEach(p => toSave[p] = this[p]);

        return toSave;
    }
}

module.exports = Portal;
