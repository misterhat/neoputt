const SAT = require('sat');

const DEFAULTS = {
    name: 'hole',
    radius: 6,
    x: 8,
    y: 8
};

class Hole {
    constructor(props = {}) {
        Object.keys(DEFAULTS).forEach(p => {
            this[p] = props[p] || DEFAULTS[p];
        });

        this.point = new SAT.Vector(this.x, this.y);
    }

    ballCollision(ball) {
        if (ball.finished && Math.abs(ball.dx) > 4 && Math.abs(ball.dy) > 4) {
            return false;
        }

        return SAT.pointInCircle(this.point, ball.circle);
    }

    swallowBall(ball) {
        ball.dx = 0;
        ball.dy = 0;
        ball.finished = true;
        ball.radius = 3;
        ball.x = this.x;
        ball.y = this.y;
    }

    tick() {
        this.point.x = this.x;
        this.point.y = this.y;
    }
}

module.exports = Hole;
