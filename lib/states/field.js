const Ball = require('../entities/ball');
const Cursor = require('../cursor');
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
        this.map = new Map(map.name, map);
        this.edit = edit;

        this.width = config.tileSize * config.width;
        this.height = config.tileSize * config.height;

        this.canvas = h('canvas.neoputt-field', {
            width: this.width,
            height: this.height
        });

        this.wrap = h('div', this.canvas);

        if (this.edit) {
            this.backupMap = new Map(this.map.name, { ...this.map });
            this.back = h('button.neoputt-button.neoputt-edit-back',
                emoji.get('back'));
            this.wrap.appendChild(this.back);
        }

        this.cursor = new Cursor(this.canvas);
        this.painter = new Painter(this.canvas);

        this.entities = this.map.entities.filter(e => {
            if (e.name === 'ball') {
                this.ball = e;
                return false;
            }

            return true;
        });

        if (!this.ball) {
            this.ball = new Ball();
        }
    }

    start() {
        this.cursor.listen();

        if (this.edit) {
            this.back.addEventListener('click', () => {
                this.game.setState('edit', [ this.backupMap ]);
            }, false);
        }

        this.dom.appendChild(this.wrap);

        this.updateHeader(this.map.name);
    }

    tick() {
        if (this.ball.finished) {
            return;
        }

        if (this.ball.ourTurn) {
            if (this.ball.calculateMove(this.cursor)) {
                this.canvas.style.cursor = 'none';
            } else {
                this.canvas.style.cursor = 'crosshair';
            }

            if (this.cursor.down) {
                this.ball.shoot();
                this.canvas.style.cursor = 'auto';
                this.cursor.down = false;
            } else if (this.cursor.rightDown) {
                this.cursor.rightDown = false;

                if (this.ball.angleOffset === Math.PI / 2) {
                    this.ball.angleOffset = 2 * (Math.PI / 2);
                } else if (!this.ball.angleOffset) {
                    this.ball.angleOffset = Math.PI / 2;
                } else {
                    this.ball.angleOffset = 0;
                }
            }
        } else if (!this.ball.isMoving()) {
            this.ball.ourTurn = true;
        }

        this.map.ballCollision(this.ball);

        if (!this.ball.isMoving()) {
            return;
        }

        for (let i = 0; i < this.entities.length; i += 1) {
            const e = this.entities[i];

            if (e.tick) {
                e.tick();
            }

            if (e.name === 'hole') {
                if (e.ballCollision(this.ball)) {
                    e.swallowBall(this.ball);

                    if (this.edit) {
                        this.game.setState('edit', [ this.backupMap ]);
                    } else {
                        this.updateHeader(`score: ${this.ball.score}`);
                    }

                    return;
                }
            }

            if (e.ballCollision) {
                e.ballCollision(this.ball);
            }
        }

        this.ball.tick();
    }

    draw() {
        this.painter.clear();

        this.painter.drawTiles(this.map.tiles);
        this.painter.drawEntities(this.map.entities);

        if (this.ball.ourTurn) {
            this.painter.drawPreviewShot(this.ball);
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
