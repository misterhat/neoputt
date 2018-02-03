const Ball = require('../ball');
const Cursor = require('../cursor');
const Map = require('../map');
const Painter = require('../painter');
const config = require('../../config');
const h = require('hyperscript');

class FieldState {
    constructor(game) {
        this.dom = game.dom;

        this.map = new Map();
        this.width = config.tileSize * config.width;
        this.height = config.tileSize * config.height;

        this.canvas = h('canvas.neoputt-field', {
            width: this.width,
            height: this.height
        });

        this.head = h('h2.neoputt-header', { style: { position: 'absolute' } });

        this.cursor = new Cursor(this.canvas);
        this.painter = new Painter(this.canvas);

        this.ball = new Ball();
        this.hole = { radius: 8, x: 200, y: 180 };
    }

    updateHeader(text) {
        this.head.innerText = text;
        this.head.style.display = 'block';
        this.head.style.left = (this.width / 2) - (this.head.offsetWidth / 2) +
                               'px';
        this.head.style.top = (this.height / 4) - (this.head.offsetHeight / 2) +
                              'px';
        setTimeout(() => {
            this.head.style.display = 'none';
        }, 2000);
    }

    start() {
        this.cursor.listen();

        this.dom.appendChild(this.canvas);
        this.dom.appendChild(this.head);

        this.updateHeader('course 1');
    }

    tick() {
        if (!this.ball.finished && !this.ball.ourTurn &&
            this.ball.dx === 0 && this.ball.dy === 0) {
            this.ball.ourTurn = true;
            this.canvas.style.cursor = 'crosshair';
        }

        if (this.cursor.down && this.ball.ourTurn) {
            this.cursor.down = false;
            this.canvas.style.cursor = 'auto';
            this.ball.shoot();
        }

        if (this.ball.ourTurn) {
            this.ball.calculateMove(this.cursor);
        }

        this.ball.move();

        if (this.ball.checkHole(this.hole)) {
            this.updateHeader('score: 0');
        }
    }

    draw() {
        this.painter.clear();
        this.painter.drawTiles(this.map.tiles);

        this.painter.drawHole(this.hole);

        if (this.ball.ourTurn) {
            this.painter.drawPreviewLine(this.ball);
        }

        this.painter.drawBall(this.ball);
    }

    end() {
        this.dom.removeChild(this.canvas);
    }
}

module.exports = FieldState;
