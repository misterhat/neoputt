const SAT = require('sat');
const config = require('../../config');

const DEFAULTS = {
    angle: 0,
    colour: '#fff',
    dx: 0,
    dy: 0,
    finished: false,
    friction: 0.95,
    name: 'ball',
    ourTurn: false,
    radius: 6,
    sinking: false,
    strength: 0,
    x: 8,
    y: 8
};

const HEIGHT = config.tileSize * config.height;
const MAX_SPEED = config.tileSize / 2;
const MAX_STRENGTH = config.tileSize * 8;
const WIDTH = config.tileSize * config.width;

class Ball {
    constructor(props = {}) {
        Object.keys(DEFAULTS).forEach(p => {
            this[p] = props[p] || DEFAULTS[p];
        });

        this.circle = new SAT.Circle(this.vector, this.radius);
        this.vector = new SAT.Vector(this.x, this.y);

        this.ticks = 0;
    }

    boundaryBounce() {
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

    isMoving() {
        return this.sinking || (this.dx !== 0 && this.dy !== 0);
    }

    scaleDx(multipler) {
        this.dx *= multipler;

        if (Math.abs(this.dx) > MAX_SPEED) {
            this.dx = this.dx > 0 ? MAX_SPEED : -MAX_SPEED;
        }
    }

    scaleDy(multipler) {
        this.dy *= multipler;

        if (Math.abs(this.dy) > MAX_SPEED) {
            this.dy = this.dy > 0 ? MAX_SPEED : -MAX_SPEED;
        }
    }

    scaleSpeed(multipler) {
        this.scaleDx(multipler);
        this.scaleDy(multipler);
    }

    shoot() {
        this.lastX = this.x;
        this.lastY = this.y;
        const str = (this.strength / MAX_STRENGTH) * 8;
        this.dx = str * Math.cos(this.angle);
        this.dy = str * Math.sin(this.angle);
        this.ourTurn = false;
    }

    tick() {
        if (this.sinking) {
            if (this.radius > 0) {
                this.radius -= 1;
            } else {
                this.sinking = false;
                this.radius = DEFAULTS.radius;
                this.x = this.lastX;
                this.y = this.lastY;
            }
        }

        if (!this.dx && !this.dy) {
            this.ticks = 0;
            return;
        }

        this.x += this.dx;
        this.y += this.dy;

        this.dx *= this.friction;
        this.dy *= this.friction;

        this.boundaryBounce();

        if (Math.abs(this.dx) <= 0.2 && Math.abs(this.dy) <= 0.2) {
            this.dx = 0;
            this.dy = 0;
        }

        this.circle.r = this.radius;
        this.circle.pos.x = this.x;
        this.circle.pos.y = this.y;

        this.ticks += 1;
    }

    toJSON() {
        const toSave = {};

        Object.keys(DEFAULTS).forEach(k => {
            toSave[k] = this[k];
        });

        return toSave;
    }

    wallContact(overlap, scale = 0.75) {
        scale = -scale;

        this.x += (overlap.x * 1.1);
        this.y += (overlap.y * 1.1);
        this.circle.pos.x = this.x;
        this.circle.pos.y = this.y;

        if (this.ticks >= config.turnTimeoutTicks) {
            this.dx = 0;
            this.dy = 0;
            return;
        }

        if (Math.abs(overlap.x) > Math.abs(overlap.y)) {
            this.scaleDx(scale);
        } else if (Math.abs(overlap.y) > Math.abs(overlap.x)) {
            this.scaleDy(scale);
        } else {
            this.scaleSpeed(scale);
        }
    }
}

module.exports = Ball;
