const config = require('../../config');

const HEIGHT = config.tileSize * config.height;
const MAX_STRENGTH = config.tileSize * 8;
const WIDTH = config.tileSize * config.width;

class Ball {
    constructor() {
        this.angle = 0;
        this.colour = '#fff';
        this.dx = 0;
        this.dy = 0;
        this.finished = false;
        this.friction = 0.96;
        this.ourTurn = false;
        this.radius = 6;
        this.strength = 0;
        this.x = 8;
        this.y = 8;
    }

    // calculate an angle & strength based on cursor position
    calculateMove(cursor) {
        const dx = cursor.x - this.x;
        const dy = cursor.y - this.y;
        let strength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        if (strength >= MAX_STRENGTH) {
            strength = MAX_STRENGTH;
        }

        this.angle = Math.atan2(dy, dx);
        this.strength = strength;
    }

    shoot() {
        const str = (this.strength / MAX_STRENGTH) * 8;
        this.dx = str * Math.cos(this.angle);
        this.dy = str * Math.sin(this.angle);
        this.ourTurn = false;
    }

    bounce() {
        const XIsLowerBound = (this.x - this.radius) <= 0;
        const XIsUpperBound = (this.x + this.radius) >= WIDTH;

        if (XIsLowerBound || XIsUpperBound) {
            this.dx = -this.dx;
        }

        const YIsLowerBound = (this.y - this.radius) <= 0;
        const YIsUpperBound = (this.y + this.radius) >= HEIGHT;

        if (YIsLowerBound || YIsUpperBound) {
            this.dy = -this.dy;
        }
    }

    move() {
        if (!this.dx && !this.dy) {
            return;
        }

        this.x += this.dx;
        this.y += this.dy;

        if (Math.abs(this.dx) <= 0.2 && Math.abs(this.dy) <= 0.2) {
            this.dx = 0;
            this.dy = 0;
        }

        this.dx *= this.friction;
        this.dy *= this.friction;

        this.bounce();
    }
}

module.exports = Ball;
