const SAT = require('sat');
const config = require('../../config');

const DEFAULTS = {
    height: config.tileSize,
    name: 'wall',
    sprite: '/img/brick.png',
    width: config.tileSize,
    x: 0,
    y: 0
};

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
        if (SAT.testPolygonCircle(this.polygon, ball.circle, this.response)) {
            const overlap = this.response.overlapV;

            ball.x += (overlap.x * 2);
            ball.y += (overlap.y * 2);
            ball.circle.pos.x = ball.x;
            ball.circle.pos.y = ball.y;

            if (Math.abs(overlap.x) > Math.abs(overlap.y)) {
                ball.dx *= -0.75;
            } else if (Math.abs(overlap.y) > Math.abs(overlap.x)) {
                ball.dy *= -0.75;
            } else {
                ball.dx *= -0.75;
                ball.dy *= -0.75;
            }

            this.response.clear();
        }
    }
}

module.exports = Wall;
