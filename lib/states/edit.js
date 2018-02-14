const Course = require('../course');
const Cursor = require('../cursor');
const Editor = require('../editor');
const Painter = require('../painter');
const config = require('../../config');
const emoji = require('node-emoji');
const h = require('hyperscript');
const hasToggle = require('../has-toggle');
const tiles = require('../tiles');

const BUTTON = 'button.neoputt-button';
const NBSP = String.fromCharCode(160);

class EditState {
    constructor(game, course = new Course()) {
        this.game = game;
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
        this.painter = new Painter(this.canvas);

        this.name = h('input.neoputt-input', {
            placeholder: 'course name...',
            title: 'course name',
            type: 'text',
            value: this.editor.course.name || '',
        });
        this.save = h(BUTTON, `${emoji.get('floppy_disk')} save`);
        this.upload = h(BUTTON, emoji.get('point_up_2') + ' upload');

        this.undo = h(BUTTON, `${emoji.get('leftwards_arrow_with_hook')} undo`);
        this.redo = h(BUTTON, `${emoji.get('arrow_right_hook')} redo`);
        this.fill = h(BUTTON);
        this.grid = h(BUTTON);
        this.clear = h(BUTTON, `${emoji.get('gun')} clear`);

        this.test = h(`${BUTTON}.neoputt-edit-test`, emoji.get('golf'), h('br'),
            `${NBSP}test${NBSP}`);
        this.back = h(`${BUTTON}.neoputt-edit-back`, emoji.get('back'), h('br'),
            'back');

        const tilesWidth = (config.tileSize * 8);

        this.tiles = h('.neoputt-tiles', {
            style: { width: `${tilesWidth - 2}px` }
        }, this.entitiesView(), h('br'), tiles.map(this.tileView.bind(this)));

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
    }

    clearFocusedTile() {
        Array.from(this.tiles.children).forEach(e => {
            e.classList.remove('neoputt-tile-f')
        });
    }

    entitiesView() {
        const tileCanvas = h('canvas', {
            width: config.tileSize,
            height: config.tileSize
        });

        const tilePainter = new Painter(tileCanvas);

        return this.editor.entities.map((e, index) => {
            const sE = this.editor.selectedEntity;

            tilePainter.clear();
            tilePainter.drawEntity(e);

            let className = '.neoputt-tile';

            if (sE && e.name === sE.name && e.sprite === sE.sprite &&
                e.colour === sE.colour) {
                className += '.neoputt-tile-f';
            }

            const view = h(className, {
                style: {
                    'background-image': `url(${tileCanvas.toDataURL()})`,
                    height: `${config.tileSize}px`,
                    width: `${config.tileSize}px`
                },
                title: e.name
            });

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

    setFill(toggle) {
        this.toggleProperty(this.editor, 'fill', this.fill, toggle);
    }

    setGrid(toggle) {
        this.toggleProperty(this.editor, 'grid', this.grid, toggle);
    }

    tileView(tile, index) {
        const selected = this.editor.selectedTile === index;
        const focused = selected ? '.neoputt-tile-f' : '';

        const view = h(`.neoputt-tile${focused}`, {
            style: {
                width: `${config.tileSize}px`,
                height: `${config.tileSize}px`
            },
            title: tile.name
        });

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

    start() {
        this.cursor.listen();

        this.name.addEventListener('change', () => {
            // TODO regex
            this.editor.course.name = this.name.value;
        }, false);

        this.save.addEventListener('click', () => {
            this.save.disabled = true;
            this.editor.course.saveToLocal();
            setTimeout(() => this.save.disabled = false, 500);
        }, false);

        this.upload.addEventListener('click', () => {
            const height = this.dom.style.height;

            this.canvas.style.transition = 'linear transform 0.3s';
            this.canvas.style.transform = `translateY(-${height})`;
            this.upload.disabled = true;

            setTimeout(() => {
                this.canvas.style.transition = 'none';
                this.canvas.style.transform = `translateY(0)`;
                this.upload.disabled = false;
            }, 500);
        }, false);

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
            this.game.setState('field', [ this.editor.course, true ]);
        }, false);

        this.back.addEventListener('click', () => {
            this.game.setState('pick');
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
        this.dom.removeChild(this.wrap);
    }
}

Object.assign(EditState.prototype, hasToggle);

module.exports = EditState;
