const collide = require('../collide');

const DEFAULTS = {
    name: 'hole',
    radius: 8,
    x: 8,
    y: 8
};

class Hole {
    constructor(props = {}) {
        Object.keys(DEFAULTS).forEach(p => {
            this[p] = props[p] || DEFAULTS[p];
        });
    }

    ballCollision(ball) {
        return (!ball.finished && Math.abs(ball.dx) < 4 &&
                Math.abs(ball.dy) < 4 && collide.circles(ball, this));
    }

    swallowBall(ball) {
        ball.dx = 0;
        ball.dy = 0;
        ball.finished = true;
        ball.radius = 4;
        ball.x = this.x;
        ball.y = this.y;
    }
}

module.exports = Hole;
