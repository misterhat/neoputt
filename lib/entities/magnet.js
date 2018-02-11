const config = require('../../config');

const DEFAULTS = {
    angle: 0,
    height: 16,
    name: 'magnet',
    pullRadius: config.tileSize * 3,
    sprite: '/img/magnet.png',
    width: 16,
    x: 0,
    y: 0
};

class Magnet {
    constructor(props = {}) {
        Object.keys(DEFAULTS).forEach(p => {
            this[p] = props[p] || DEFAULTS[p];
        });
    }

    ballCollision(ball) {
        const x = this.x + (this.width / 2);
        const y = this.y + (this.height / 2);
        const dist = Math.sqrt(((ball.x - x) * (ball.x - x)) + ((ball.y - y) *
            (ball.y - y)));

        if (!ball.isFast() && dist > (config.tileSize * 0.75) &&
            dist < this.pullRadius) {
            const deltaX = x - ball.x;
            const deltaY = y - ball.y;
            const scaledDist = (dist / this.pullRadius);

            ball.dx += (deltaX * (scaledDist / 10));
            ball.dy += (deltaY * (scaledDist / 10));
            this.angle = Math.atan2(this.y - ball.y, this.x - ball.x) +
                (Math.PI / 2);
        }
    }

    tick() {
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
