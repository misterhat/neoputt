const SAT = require('sat');
const config = require('../../config');

const DEFAULTS = {
    angle: 0,
    angleOffset: 0,
    colour: '#fff',
    dx: 0,
    dy: 0,
    finished: false,
    friction: 0.95,
    fromPortal: 0,
    name: 'ball',
    ourTurn: false,
    radius: 6,
    score: 0,
    sinking: false,
    strength: 0,
    ticks: 0,
    toX: -1,
    toY: -1,
    x: 8,
    y: 8
};
const HEIGHT = config.tileSize * config.height;
const MAX_SPEED = config.tileSize / 2;
const MAX_STRENGTH = config.tileSize * config.maxStrength;
const MIN_SPEED = 0.2;
const SAVE = [ 'name', 'x', 'y' ];
const WIDTH = config.tileSize * config.width;

class Ball {
    constructor(props = {}) {
        Object.keys(DEFAULTS).forEach(p => {
            this[p] = props[p] || DEFAULTS[p];
        });

        this.vector = new SAT.Vector(this.x, this.y);
        this.circle = new SAT.Circle(this.vector, this.radius);
    }

    boundaryBounce() {
        const XIsLowerBound = (this.x - this.radius) <= 0;
        const XIsUpperBound = (this.x + this.radius) >= WIDTH;

        if (XIsLowerBound || XIsUpperBound) {
            this.dx = -this.dx;
            this.x += this.dx;
        }

        const YIsLowerBound = (this.y - this.radius) <= 0;
        const YIsUpperBound = (this.y + this.radius) >= HEIGHT;

        if (YIsLowerBound || YIsUpperBound) {
            this.dy = -this.dy;
            this.y += this.dy;
        }

        this.refreshCircle();
    }

    // calculate an angle & strength based on cursor position.
    // returns whether or not the cursor is close enough to the ball to hide
    // the cursor.
    calculateMove(cursor) {
        const dx = cursor.x - this.x;
        const dy = cursor.y - this.y;
        let close = true;
        let strength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        if (strength > MAX_STRENGTH) {
            close = false;
            strength = MAX_STRENGTH;
        }

        this.angle = Math.atan2(dy, dx) + this.angleOffset;
        this.strength = strength;

        return close;
    }

    getSpeed() {
        return (Math.abs(this.dx) + Math.abs(this.dy)) / (MAX_SPEED * 2);
    }

    isFast() {
        const fast = MAX_SPEED / 2;
        return Math.abs(this.dx) >= fast || Math.abs(this.dy) >= fast;
    }

    isMoving() {
        return this.sinking || Math.abs(this.dx) > MIN_SPEED ||
            Math.abs(this.dy) > MIN_SPEED;
    }

    // some entities/tiles make it possible to get stuck an infinite loop, so
    // timeout after a certain number of frames.
    isTimedOut() {
        return this.ticks >= config.turnTimeoutTicks;
    }

    refreshCircle() {
        this.circle.r = this.radius;
        this.circle.pos.x = this.x;
        this.circle.pos.y = this.y;
    }

    refreshFromPortal() {
        const dx = Math.pow(this.x - this.toX, 2);
        const dy = Math.pow(this.y - this.toY, 2);
        this.fromPortal = (config.tileSize / 2) - Math.sqrt(dx + dy);
    }

    // set the ball to the position it was before shooting. called after
    // sinking.
    resetPos() {
        this.dx = 0;
        this.dy = 0;
        this.radius = DEFAULTS.radius;
        this.x = this.lastX;
        this.y = this.lastY;
    }

    // called after the player clicks the mouse. initiates the dx and dy based
    // on the angle set by calculateMove.
    shoot() {
        const str = (this.strength / MAX_STRENGTH) * 8;
        this.dx = str * Math.cos(this.angle);
        this.dy = str * Math.sin(this.angle);
        this.lastX = this.x;
        this.lastY = this.y;
        this.ourTurn = false;
        this.score += 1;
        this.ticks = 0;
    }

    stop() {
        this.dx = 0;
        this.dy = 0;
        this.ticks = 0;

        return;
    }

    throttle() {
        if (Math.abs(this.dx) > MAX_SPEED) {
            this.dx = this.dx > 0 ? MAX_SPEED : -MAX_SPEED;
        }

        if (Math.abs(this.dy) > MAX_SPEED) {
            this.dy = this.dy > 0 ? MAX_SPEED : -MAX_SPEED;
        }
    }

    tick() {
        if (this.sinking) {
            if (this.radius >= 0) {
                this.radius -= 0.4;
            } else {
                this.sinking = false;

                // a portal has set our toX and toY
                if (this.toX !== -1 && this.toY !== -1) {
                    this.radius = DEFAULTS.radius;
                    this.x = this.toX;
                    this.y = this.toY;
                    this.refreshCircle();
                    this.refreshFromPortal();
                } else {
                    this.resetPos();
                }
            }

            return;
        }

        if (this.isTimedOut() || !this.isMoving()) {
            this.stop();
            return;
        }

        // we haven't moved far enough away to reset portal collision yet.
        if (this.fromPortal > 0) {
            this.refreshFromPortal();

            if (this.fromPortal <= 0) {
                this.fromPortal = 0;
                this.toX = -1;
                this.toY = -1;
            }
        }

        this.x += this.dx;
        this.y += this.dy;
        this.refreshCircle();

        this.dx *= this.friction;
        this.dy *= this.friction;

        this.boundaryBounce();
        this.throttle();

        this.ticks += 1;
    }

    toJSON() {
        const toSave = {};
        SAVE.forEach(k => toSave[k] = this[k]);

        return toSave;
    }

    // overlap is an object with {x, y} of how far the ball has entered the
    // wall.
    // scale is the multiplier for ball's dx and dy after moving it away from
    // the wall.
    wallContact(overlap, scale = 0.75) {
        scale = -scale;

        this.x += (overlap.x * 1.1);
        this.y += (overlap.y * 1.1);
        this.refreshCircle();

        if (Math.abs(overlap.x) > Math.abs(overlap.y)) {
            this.dx *= scale;
        } else if (Math.abs(overlap.y) > Math.abs(overlap.x)) {
            this.dy *= scale;
        } else {
            this.dx *= scale;
            this.dy *= scale;
        }

        this.throttle();
    }
}

module.exports = Ball;
