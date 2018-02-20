const Ball = require('../entities/ball');
const Course = require('../course');
const Cursor = require('../cursor');
const Painter = require('../painter');
const SoundPlayer = require('../sound-player');
const config = require('../../config');
const emoji = require('node-emoji').emoji;
const h = require('hyperscript');
const hasHeader = require('../has-header');

class FieldState {
    constructor(game, course = new Course(), edit = false) {
        this.game = game;
        this.course = new Course(course.name, course);
        this.edit = edit;

        this.actions = [];
        this.assets = game.assets;
        this.dom = game.dom;
        this.entityCollision = null;
        this.height = config.tileSize * config.height;
        this.lastTileCollision = -1;
        this.width = config.tileSize * config.width;

        this.entities = this.course.entities.filter(e => {
            if (e.name === 'ball') {
                this.ball = e;
                return false;
            }

            return true;
        });

        if (!this.ball) {
            this.ball = new Ball();
        }

        if (!process.browser) {
            return;
        }

        this.canvas = h('canvas.neoputt-field', {
            width: this.width,
            height: this.height
        });

        this.wrap = h('div', this.canvas);

        if (this.edit) {
            this.backupCourse = new Course(this.course.name,
                Object.assign({}, this.course));
            this.back = h('button.neoputt-button.neoputt-edit-back', emoji.back);
            this.wrap.appendChild(this.back);
        }

        this.cursor = new Cursor(this.canvas);
        this.painter = new Painter(this.canvas, this.assets);
        this.soundPlayer = new SoundPlayer(this.assets);
    }

    start() {
        this.cursor.listen();

        if (this.edit) {
            this.back.addEventListener('click', () => {
                this.game.setState('edit', [ this.backupCourse ]);
            }, false);
        }

        this.dom.appendChild(this.wrap);

        this.updateHeader(this.course.name);
    }

    tick() {
        if (this.ball.finished) {
            return;
        }

        if (this.ball.ourTurn) {
            this.cursorClose = this.ball.calculateMove(this.cursor);

            if (this.cursor.down) {
                this.actions.push({
                    angle: this.ball.angle,
                    strength: this.ball.strength,
                    type: 'shot'
                });
                this.ball.shoot();
                this.cursor.down = false;
            } else if (this.cursor.rightDown) {
                this.cursor.rightDown = false;

                if (this.ball.angleOffset === Math.PI) {
                    this.ball.angleOffset = (3 * Math.PI) / 2;
                } else if (this.ball.angleOffset === Math.PI / 2) {
                    this.ball.angleOffset = Math.PI;
                } else if (this.ball.angleOffset === 0) {
                    this.ball.angleOffset = Math.PI / 2;
                } else {
                    this.ball.angleOffset = 0;
                }
            }
        } else if (!this.ball.isMoving()) {
            this.ball.angleOffset = 0;
            this.ball.ourTurn = true;
            this.lastTileCollision = -1;
        }

        if (!this.ball.isMoving()) {
            return;
        }

        this.entityCollision = null;
        this.tileCollision = this.course.ballCollision(this.ball);

        for (let i = 0; i < this.entities.length; i += 1) {
            const e = this.entities[i];

            if (e.tick) {
                e.tick();
            }

            if (!e.ballCollision) {
                return;
            }

            const collision = e.ballCollision(this.ball);

            if (collision) {
                this.entityCollision = { entity: e, volume: collision };

                if (e.name === 'hole') {
                    e.swallowBall(this.ball);

                    this.actions.push({ action: 'win' });

                    if (this.edit) {
                        this.game.setState('edit', [ this.backupCourse ]);
                    } else {
                        this.updateHeader(`score: ${this.ball.score}`);
                    }

                    return;
                }
            }
        }

        this.ball.tick();
    }

    draw() {
        this.painter.clear();

        this.painter.drawTiles(this.course.tiles);
        this.painter.drawEntities(this.course.entities);

        if (this.ball.ourTurn) {
            if (this.cursorClose) {
                this.canvas.style.cursor = 'none';
            } else {
                this.canvas.style.cursor = 'crosshair';
            }

            this.painter.drawPreviewShot({
                angle: this.ball.angle,
                angleOffset: this.ball.angleOffset,
                strength: this.ball.strength,
                x: this.ball.x - 1,
                y: this.ball.y - 1
            }, true);

            this.painter.drawPreviewShot(this.ball);

            if (this.cursor.down) {
                this.canvas.style.cursor = 'auto';
                this.soundPlayer.playShot(this.ball);
            }
        } else if (!this.ball.isMoving() && !this.ball.finished) {
            this.soundPlayer.stopAll();
        }

        this.painter.drawBall(this.ball);

        if (!this.ball.isMoving()) {
            return;
        }

        if (this.tileCollision !== this.lastTileCollision) {
            if (/^3|4|5$/.test(this.lastTileCollision) && this.tileSound) {
                this.tileSound.pause();
            }

            this.tileSound = this.soundPlayer.playTileCollision(this.ball,
                this.tileCollision);
            this.lastTileCollision = this.tileCollision;
        }

        if (this.tileSound && /^3|4|5$/.test(this.tileCollision)) {
            this.tileSound.volume = this.ball.getSpeed();
        }

        if (this.entityCollision) {
            this.soundPlayer.playBallCollision(this.ball,
                this.entityCollision.entity, this.entityCollision.volume);
        }
    }

    end() {
        this.soundPlayer.stopAll();
        this.removeHeader();
        this.dom.removeChild(this.wrap);
    }
}

Object.assign(FieldState.prototype, hasHeader);

module.exports = FieldState;
