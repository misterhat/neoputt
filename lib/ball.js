const collide = require('./collide');
const config = require('../config');

const MAX_STRENGTH = config.tileSize * 8;

class Ball {
    constructor() {
        this.angle = 0;
        this.dx = 0;
        this.dy = 0;
        this.finished = false;
        this.friction = 0.96;
        this.ourTurn = false;
        this.radius = 6;
        this.strength = 0;
        this.x = 300;
        this.y = 100;
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

    checkHole(hole) {
        if (!this.finished && Math.abs(this.dx) < 4 && Math.abs(this.dy) < 4 &&
            collide.circles(this, hole)) {
            this.dx = 0;
            this.dy = 0;
            this.finished = true;
            this.radius = 4;
            this.x = hole.x;
            this.y = hole.y;

            return true;
        }

        return false;
    }

    move() {
        if (!this.dx && !this.dy) {
            return;
        }

        this.x += this.dx;
        this.y += this.dy;

        if (Math.abs(this.dx) <= 0.1 && Math.abs(this.dy) <= 0.1) {
            this.dx = 0;
            this.dy = 0;
        }

        this.dx *= this.friction;
        this.dy *= this.friction;
    }
}

module.exports = Ball;
