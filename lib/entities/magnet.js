const config = require('../../config');

const DEFAULTS = {
    angle: 0,
    height: 16,
    name: 'magnet',
    polarity: 1,
    pullRadius: config.tileSize * 1.5,
    width: 16,
    x: 0,
    y: 0
};
const SAVE = [ 'name', 'polarity', 'x', 'y' ];

class Magnet {
    constructor(props = {}) {
        Object.keys(DEFAULTS).forEach(p => {
            this[p] = props[p] || DEFAULTS[p];
        });

        this.sprite = `/img/${this.polarity !== 1 ? 'reverse-' : ''}magnet.png`;
    }

    ballCollision(ball) {
        const x = this.x + (this.width / 2);
        const y = this.y + (this.height / 2);
        const deltaX = x - ball.x;
        const deltaY = y - ball.y;
        const dist = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));

        if (!ball.isFast() &&
            dist > (config.tileSize * 0.75) && dist < this.pullRadius) {
            const scaledDist = (dist / this.pullRadius) / 10;

            ball.dx += deltaX * scaledDist * this.polarity;
            ball.dy += deltaY * scaledDist * this.polarity;

            this.angle = Math.atan2(y - ball.y, x - ball.x) + (Math.PI / 2);

            return scaledDist * 10;
        }
    }

    toJSON() {
        const toSave = {};
        SAVE.forEach(p => toSave[p] = this[p]);

        return toSave;
    }
}

module.exports = Magnet;
