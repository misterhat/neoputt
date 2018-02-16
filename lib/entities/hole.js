const SAT = require('sat');

const DEFAULTS = {
    name: 'hole',
    radius: 8,
    x: 8,
    y: 8
};
const SAVE = [ 'name', 'x', 'y' ];

class Hole {
    constructor(props = {}) {
        Object.keys(DEFAULTS).forEach(p => {
            this[p] = props[p] || DEFAULTS[p];
        });

        this.point = new SAT.Vector(this.x, this.y);
    }

    ballCollision(ball) {
        if (ball.finished || Math.abs(ball.dx) > 4 || Math.abs(ball.dy) > 4) {
            return false;
        }

        return SAT.pointInCircle(this.point, ball.circle);
    }

    refreshPoint() {
        this.point.x = this.x;
        this.point.y = this.y;
    }

    swallowBall(ball) {
        ball.dx = 0;
        ball.dy = 0;
        ball.finished = true;
        ball.radius = 4;
        ball.x = this.x;
        ball.y = this.y;
    }

    tick() {
        this.refreshPoint();
    }

    toJSON() {
        const toSave = {};
        SAVE.forEach(p => toSave[p] = this[p]);

        return toSave;
    }
}

module.exports = Hole;
