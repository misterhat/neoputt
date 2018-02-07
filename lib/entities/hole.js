const collide = require('../collide');

class Hole {
    constructor() {
        this.radius = 8;
        this.x = 8;
        this.y = 8;
    }

    checkBall(ball) {
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
