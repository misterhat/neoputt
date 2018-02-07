const Ball = require('../entities/ball');
const Cursor = require('../cursor');
const Hole = require('../entities/hole');
const Map = require('../map');
const Painter = require('../painter');
const config = require('../../config');
const emoji = require('node-emoji');
const h = require('hyperscript');
const hasHeader = require('../has-header');

class FieldState {
    constructor(game, map = new Map(), edit = false) {
        this.game = game;
        this.dom = game.dom;
        this.map = map;
        this.edit = edit;

        this.width = config.tileSize * config.width;
        this.height = config.tileSize * config.height;

        this.canvas = h('canvas.neoputt-field', {
            width: this.width,
            height: this.height
        });

        this.wrap = h('div', this.canvas);

        if (this.edit) {
            this.back = h('button.neoputt-button.neoputt-edit-back',
                emoji.get('back'));
            this.wrap.appendChild(this.back);
        }

        this.cursor = new Cursor(this.canvas);
        this.painter = new Painter(this.canvas);

        this.ball = new Ball();
        this.hole = new Hole();

        this.ball.x = 32;
        this.ball.y = 32;
    }

    start() {
        this.cursor.listen();

        if (this.edit) {
            this.back.addEventListener('click', () => {
                this.game.setState('edit', [ this.map ]);
            }, false);
        }

        this.dom.appendChild(this.wrap);

        this.updateHeader(this.map.name);
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

        if (this.hole.checkBall(this.ball)) {
            this.hole.swallowBall(this.ball);
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
        this.removeHeader();
        this.dom.removeChild(this.wrap);
    }
}

Object.assign(FieldState.prototype, hasHeader);

module.exports = FieldState;
