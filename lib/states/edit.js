const Course = require('../course');
const Cursor = require('../cursor');
const Editor = require('../editor');
const Painter = require('../painter');
const config = require('../../config');
const emoji = require('node-emoji').emoji;
const getToken = require('../get-token');
const h = require('hyperscript');
const hasHeader = require('../has-header');
const hasToggle = require('../has-toggle');
const postCourse = require('../post-course');
const tiles = require('../tiles');
const validate = require('../validate');
const xhr = require('xhr');

const BUTTON = 'button.neoputt-button';
const NBSP = String.fromCharCode(160);
const THROTTLE = config.coursePostThrottle * 1000;

class EditState {
    constructor(game, course = new Course()) {
        this.game = game;

        this.assets = game.assets;
        this.cursorWasDown = false;
        this.dom = game.dom;

        const clone = new Course(course.name, course);
        this.editor = new Editor(clone);
        this.editor.loadState();

        const toolHeight = (config.tileSize * 5);
        const oHeight = config.tileSize * config.height;
        const oWidth = config.tileSize * config.width;
        const sHeight = oHeight - toolHeight - 1;
        const sWidth = Math.floor((sHeight / oHeight) * oWidth);

        this.canvas = h('canvas.neoputt-editor', {
            height: oHeight,
            style: {
                height: `${sHeight}px`,
                width: `${sWidth}px`
            },
            width: oWidth
        });

        this.cursor = new Cursor(this.canvas);
        this.painter = new Painter(this.canvas, this.assets);

        this.name = h('input.neoputt-input', {
            attrs: { maxlength: config.maxNameLength },
            placeholder: 'course name...',
            title: 'course name',
            type: 'text',
            value: this.editor.course.name || ''
        });
        this.save = h(BUTTON, `${emoji['floppy_disk']} save`);
        this.upload = h(BUTTON, `${emoji['point_up_2']} upload`);

        this.undo = h(BUTTON, `${emoji['leftwards_arrow_with_hook']} undo`);
        this.redo = h(BUTTON, `${emoji['arrow_right_hook']} redo`);
        this.fill = h(BUTTON);
        this.grid = h(BUTTON);
        this.clear = h(BUTTON, `${emoji['gun']} clear`);

        this.test = h(`${BUTTON}.neoputt-edit-test`, emoji.golf, h('br'),
            `${NBSP}test${NBSP}`);
        this.back = h(`${BUTTON}.neoputt-edit-back`, emoji.back, h('br'),
            'back');

        const tilesWidth = (config.tileSize * 8);

        this.tiles = h('.neoputt-tiles', {
            style: { width: `${tilesWidth - 2}px` }
        },
            this.deleteTileView(),
            this.entitiesView(), h('br'), tiles.map(this.tileView.bind(this)));

        const fToolHeight = (toolHeight - 6);

        this.wrap = h('div', { style: { 'background-color': '#aaa' } },
            h('.neoputt-toolbox', { style: { height: `${fToolHeight - 1}px` } },
                h('.neoputt-tools', {
                    style: { width: `${oWidth - tilesWidth - 4}px` }
                },
                    this.name, this.save, this.upload, h('br'), this.undo,
                    this.redo, this.fill, this.grid, this.clear), this.tiles,
                    h('.neoputt-clear')),
            this.canvas, this.test, this.back);

        window.getCourse = () => {
            document.body.innerHTML = JSON.stringify(this.editor.course);
        };
    }

    clearFocusedTile() {
        Array.from(this.tiles.children).forEach(e => {
            e.classList.remove('neoputt-tile-f');
        });
    }

    deleteTileView() {
        const focused = this.editor.selectedEntity === -2;
        const view = h(`.neoputt-tile${focused ? '.neoputt-tile-f' : ''}`, {
            style: {
                'background-image': 'url(/img/delete.png)',
                'line-height': `${config.tileSize}px`,
                height: `${config.tileSize}px`,
                width: `${config.tileSize}px`
            },
            title: 'delete object'
        }, NBSP);

        view.addEventListener('click', () => {
            this.editor.selectEntity(-2);
            this.editor.selectedTile = -1;
            this.clearFocusedTile();
            view.classList.add('neoputt-tile-f');
        }, false);

        return view;
    }

    entitiesView() {
        const tileCanvas = h('canvas', {
            width: config.tileSize,
            height: config.tileSize
        });

        const tilePainter = new Painter(tileCanvas, this.assets);

        return this.editor.entities.map((e, index) => {
            const sE = this.editor.selectedEntity;

            tilePainter.clear();
            tilePainter.drawEntity(e);

            let focused = (sE && e.name === sE.name && e.sprite === sE.sprite
                           && e.colour === sE.colour);

            const view = this.tileButtonView(e, focused);
            view.style['background-image'] = `url(${tileCanvas.toDataURL()})`;

            view.addEventListener('click', () => {
                this.editor.selectEntity(index);
                this.editor.selectedTile = -1;
                this.clearFocusedTile();
                view.classList.add('neoputt-tile-f');
            }, false);

            return view;
        });
    }

    refreshUndoRedo() {
        this.undo.disabled = !this.editor.undoHistory.length;
        this.redo.disabled = !this.editor.redoHistory.length;
    }

    saveToLocal() {
        setTimeout(() => {
            this.name.disabled = false;
            this.save.disabled = false;
        }, 300);

        this.name.disabled = true;
        this.save.disabled = true;
        this.editor.course.saveToLocal();
    }

    setFill(toggle) {
        this.toggleProperty(this.editor, 'fill', this.fill, toggle);
    }

    setGrid(toggle) {
        this.toggleProperty(this.editor, 'grid', this.grid, toggle);
    }

    tileButtonView(obj, focused) {
        const view = h(`.neoputt-tile${focused ? '.neoputt-tile-f' : ''}`, {
            style: {
                'line-height': `${config.tileSize}px`,
                height: `${config.tileSize}px`,
                width: `${config.tileSize}px`
            },
            title: obj.name
        }, NBSP);

        return view;
    }

    tileView(tile, index) {
        const selected = this.editor.selectedTile === index;
        const view = this.tileButtonView(tile, selected);

        if (tile.colour) {
            view.style['background-color'] = tile.colour;
        } else if (tile.sprite) {
            view.style['background-image'] = `url(${tile.sprite})`;
        }

        view.addEventListener('click', () => {
            this.editor.selectEntity(-1);
            this.editor.selectedTile = index;

            this.clearFocusedTile();
            view.classList.add('neoputt-tile-f');
        }, false);

        return view;
    }

    uploadCourse() {
        const height = this.dom.offsetHeight;

        this.canvas.style.transform = `translateY(-${height}px)`;
        this.canvas.style.transition = 'linear transform 0.5s';
        this.dom.style.cursor = 'wait';
        this.name.disabled = true;
        this.upload.disabled = true;

        const reEnable = () => {
            this.canvas.style.transition = 'none';
            this.canvas.style.transform = `translateY(0)`;
            this.dom.style.cursor = 'auto';
            this.name.disabled = false;
            this.upload.disabled = false;
        };

        getToken((err, token) => {
            if (err) {
                this.updateHeader('server error', '#b00');
                reEnable();
                return;
            }

            postCourse(this.editor.course, token, (err, body, res) => {
                if (err) {
                    this.updateHeader('server error', '#b00');
                    reEnable();
                    return;
                }

                if (!/^2/.test(res.statusCode)) {
                    this.updateHeader(body, '#b00');

                    if (res.statusCode === 429) {
                        reEnable();
                        this.upload.disabled = true;
                        setTimeout(() => {
                            this.upload.disabled = false;
                        }, (+res.headers['retry-after']) * 1000);
                        return;
                    } else if (/^name/.test(body)) {
                        this.name.style['background-color'] = '#b00';
                    }
                } else {
                    this.updateHeader(body, '#0b0');
                }

                reEnable();
            });
        });
    }

    start() {
        this.cursor.listen();

        this.name.addEventListener('change', () => {
            if (validate.name(this.name.value)) {
                this.editor.course.name = this.name.value;
                this.name.style['background-color'] = '#fff';
            } else {
                this.name.style['background-color'] = '#b00';
            }
        }, false);

        this.name.addEventListener('keyup', e => {
            if (e.keyCode === 13) {
                this.saveToLocal();
            }
        }, false);

        this.save.addEventListener('click', () => this.saveToLocal(), false);
        this.upload.addEventListener('click', () => this.uploadCourse(), false);

        this.undo.addEventListener('click', () => {
            this.editor.undo();
            this.refreshUndoRedo();
        }, false);

        this.redo.addEventListener('click', () => {
            this.editor.redo();
            this.refreshUndoRedo();
        }, false);

        this.fill.addEventListener('click', () => this.setFill(), false);
        this.grid.addEventListener('click', () => this.setGrid(), false);

        this.clear.addEventListener('click', () => {
            this.editor.clear();
            this.refreshUndoRedo();
        }, false);

        this.test.addEventListener('click', () => {
            this.game.setState('field', [ this.editor.course, 'edit' ]);
        }, false);

        this.back.addEventListener('click', () => {
            this.game.setState('pick', [ 'edit' ]);
        }, false);

        this.setFill(this.editor.fill);
        this.setGrid(this.editor.grid);
        this.refreshUndoRedo();

        this.dom.appendChild(this.wrap);
    }

    tick() {
        this.editor.setCellCoords(this.cursor.x, this.cursor.y);
        this.editor.refreshEntityCoords();

        if (this.cursor.down) {
            this.editor.cursorDown();
        } else if (this.editor.cursorWasDown) {
            this.editor.cursorUp();
            this.refreshUndoRedo();
        }
    }

    draw() {
        this.painter.clear();
        this.painter.drawEditorCourse(this.editor);
    }

    end() {
        this.editor.saveState();
        this.removeHeader();
        this.dom.removeChild(this.wrap);
    }
}

Object.assign(EditState.prototype, hasHeader);
Object.assign(EditState.prototype, hasToggle);

module.exports = EditState;
