const config = require('../../config');

const Painter = require('../painter');
const collide = require('../collide');
const h = require('hyperscript');

const MAX_STRENGTH = config.tileSize * 8;

function updateBall(ball) {
    if (ball.dx || ball.dy) {
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (Math.abs(ball.dx) <= 0.1 && Math.abs(ball.dy) <= 0.1) {
            ball.dx = 0;
            ball.dy = 0;
        }

        ball.dx *= ball.friction;
        ball.dy *= ball.friction;
    }
}

class FieldState {
    constructor(game) {
        this.dom = game.dom;

        this.width = config.tileSize * config.width;
        this.height = config.tileSize * config.height;

        this.canvas = h('canvas.neoputt-field', {
            width: this.width,
            height: this.height
        });

        this.canvas.imageSmoothingEnabled = false;

        this.head = h('h2.neoputt-heading', {
            style: { position: 'absolute' }
        });

        this.painter = new Painter(this.canvas);

        this.cursor = {
            down: false,
            x: -1,
            y: -1
        };

        // TODO: maybe move this out?
        this.ball = {
            angle: 0,
            friction: 0.96,
            dx: 0,
            dy: 0,
            ourTurn: false,
            radius: 6,
            strength: 0,
            x: 300,
            y: 100,
        };

        this.hole = {
            radius: 8,
            x: 200,
            y: 180
        };

        window.ball = this.ball; // TODO remove
    }

    updateHeader(text) {
        this.head.innerText = text;
        this.head.style.left = (this.width / 2) -
                               (this.head.offsetWidth / 2) + 'px';
        this.head.style.top = (this.height / 4) -
                              (this.head.offsetHeight / 2) + 'px';
        setTimeout(() => {
            this.head.style.display = 'none';
        }, 2000);
    }

    start() {
        const listeners = {
            'mousedown': e => {
                if (e.button === 0) {
                    this.cursor.down = true;
                }
            },
            'mouseup': e => {
                if (e.button === 0) {
                    this.cursor.down = false;
                }
            },
            'mousemove': e => {
                const rect = this.dom.getBoundingClientRect();
                this.cursor.x = e.pageX - rect.left - window.scrollX;
                this.cursor.y = e.pageY - rect.top - window.scrollY;
            }
        };

        Object.keys(listeners).forEach(l => {
            this.canvas.addEventListener(l, listeners[l]);
        });

        this.dom.appendChild(this.head);
        this.dom.appendChild(this.canvas);

        this.updateHeader('course 1');
    }

    draw() {
        this.painter.clear();
        this.painter.drawBackground();

        this.painter.drawHole(this.hole);

        if (this.ball.ourTurn) {
            this.painter.drawPreviewLine(this.ball);
        }

        this.painter.drawBall(this.ball);
    }

    tick() {
        if (this.cursor.down && this.ball.ourTurn) {
            this.cursor.down = false;
            this.ball.ourTurn = false;
            this.canvas.style.cursor = 'auto';

            const str = (this.ball.strength / MAX_STRENGTH) * 6;

            this.ball.dx = str * Math.cos(this.ball.angle);
            this.ball.dy = str * Math.sin(this.ball.angle);
        }

        if (this.ball.ourTurn) {
            const dx = this.cursor.x - this.ball.x;
            const dy = this.cursor.y - this.ball.y;
            let strength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

            if (strength >= MAX_STRENGTH) {
                strength = MAX_STRENGTH;
            }

            this.ball.angle = Math.atan2(dy, dx);
            this.ball.strength = strength;
        }

        updateBall(this.ball);

        if ((this.ball.x - this.ball.radius) <= 0) {
            this.ball.dx = -this.ball.dx;
        }

        if ((this.ball.y - this.ball.radius) <= 0) {
            this.ball.dy = -this.ball.dy;
        }

        if ((this.ball.x + this.ball.radius) >= this.width) {
            this.ball.dx = -this.ball.dx;
        }

        if ((this.ball.y + this.ball.radius) >= this.height) {
            this.ball.dy = -this.ball.dy;
        }

        if (!this.ball.inHole &&
            Math.abs(this.ball.dx) < 4 &&
            Math.abs(this.ball.dy) < 4 &&
            collide.circles(this.ball, this.hole)) {
            this.ball.dx = 0;
            this.ball.dy = 0;
            this.ball.inHole = true;
            this.ball.radius = 4;
            this.ball.x = this.hole.x;
            this.ball.y = this.hole.y;
        }

        if (!this.ball.inHole && !this.ball.ourTurn && this.ball.dx === 0 &&
            this.ball.dy === 0) {
            this.ball.ourTurn = true;
            this.canvas.style.cursor = 'crosshair';
        }
    }

    end() {
        this.dom.removeChild(this.canvas);
    }
}

module.exports = FieldState;
