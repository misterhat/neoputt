const Cursor = require('../cursor');
const Editor = require('../editor');
const Map = require('../map');
const Painter = require('../painter');
const TILES = require('../tiles');
const config = require('../../config');
const emoji = require('node-emoji');
const h = require('hyperscript');
const hasToggle = require('../has-toggle');

const nbsp = String.fromCharCode(160);

class EditState {
    constructor(game, map = new Map()) {
        this.game = game;
        this.dom = game.dom;

        const clone = new Map(map.name, map);
        this.editor = new Editor(clone);

        this.test = h('button.neoputt-button.neoputt-edit-test',
            emoji.get('golf'), h('br'), nbsp + 'test' + nbsp);
        this.back = h('button.neoputt-button.neoputt-edit-back',
            emoji.get('back'), h('br'), 'back');

        const toolHeight = (config.tileSize * 5);
        const oHeight = config.tileSize * config.height;
        const oWidth = config.tileSize * config.width;
        const sHeight = oHeight - toolHeight - 1;
        const sWidth = Math.floor((sHeight / oHeight) * oWidth);

        this.canvas = h('canvas.neoputt-editor', {
            height: oHeight,
            style: {
                height: sHeight + 'px',
                width: sWidth + 'px',
            },
            width: oWidth
        });

        this.cursor = new Cursor(this.canvas);
        this.painter = new Painter(this.canvas);

        this.nameInput = h('input.neoputt-input', {
            placeholder: 'course name...',
            title: 'course name',
            type: 'text',
            value: this.editor.map.name || '',
        });

        this.save = h('button.neoputt-button', emoji.get('floppy_disk') +
            ' save');
        this.upload = h('button.neoputt-button', emoji.get('point_up_2') +
            ' upload');
        this.undo = h('button.neoputt-button',
            `${emoji.get('leftwards_arrow_with_hook')} undo`);
        this.redo = h('button.neoputt-button',
            `${emoji.get('arrow_right_hook')} redo`);
        this.useFill = h('button.neoputt-button');
        this.useGrid = h('button.neoputt-button');
        this.useClear = h('button.neoputt-button', emoji.get('gun') + ' clear');

        const tilesWidth = (config.tileSize * 8);

        this.tiles = h('.neoputt-tiles', {
            style: { width: `${tilesWidth - 2}px` }
        }, this.entitiesView(), h('br'), TILES.map(this.tileView.bind(this)));

        const fToolHeight = (toolHeight - 6);

        this.wrap = h('div', { style: { 'background-color': '#aaa' } },
            h('.neoputt-toolbox', { style: { height: `${fToolHeight}px` } },
                h('.neoputt-tools', {
                    style: { width: `${oWidth - tilesWidth - 4}px` }
                },
                    this.nameInput, this.save, this.upload, h('br'), this.undo,
                    this.redo, this.useFill, this.useGrid,
                    this.useClear),
                    this.tiles,
                    h('.neoputt-clear')),
            this.canvas,
            this.back,
            this.test);
    }

    entitiesView() {
        const tileCanvas = h('canvas', {
            width: config.tileSize,
            height: config.tileSize
        });

        const tilePainter = new Painter(tileCanvas);

        return this.editor.entities.map((e, index) => {
            tilePainter.clear();
            tilePainter.drawEntity(e);

            const view= h('.neoputt-tile', {
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
            }, false);

            return view;
        });
    }

    tileView(tile, index) {
        const view = h('.neoputt-tile', {
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

            for (let i = 0; i < this.tiles.children.length; i += 1) {
                const e = this.tiles.children[i];

                if (e === view) {
                    e.classList.add('neoputt-tile-f');
                } else {
                    e.classList.remove('neoputt-tile-f');
                }
            }
        }, false);

        return view;
    }

    setFill(toggle) {
        this.toggleProperty(this.editor, 'fill', this.useFill, toggle);
    }

    setGrid(toggle) {
        this.toggleProperty(this.editor, 'grid', this.useGrid, toggle);
    }

    start() {
        this.cursor.listen();

        this.nameInput.addEventListener('change', () => {
            // TODO regex
            this.editor.map.name = this.nameInput.value;
        }, false);

        this.save.addEventListener('click', () => {
            this.save.disabled = true;
            this.editor.map.saveToLocal();
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

        this.useFill.addEventListener('click', () => {
            this.setFill();
        }, false);

        this.useGrid.addEventListener('click', () => {
            this.setGrid();
        }, false);

        this.useClear.addEventListener('click', () => {
            this.editor.clear();
        }, false);

        this.test.addEventListener('click', () => {
            this.game.setState('field', [ this.editor.map, true ]);
        }, false);

        this.back.addEventListener('click', () => {
            this.game.setState('pick');
        }, false);

        this.setFill(false);
        this.setGrid(true);

        this.dom.appendChild(this.wrap);
    }

    tick() {
        this.editor.setCellCoords(this.cursor.x, this.cursor.y);

        this.editor.refreshEntityCoords();

        if (this.cursor.down) {
            if (this.editor.selectedEntity !== -1) {
                this.editor.addEntity();
            } else if (this.editor.selectedTile !== -1) {
                this.editor.addTile();
            }
        }
    }

    draw() {
        this.painter.clear();
        this.painter.drawEditorMap(this.editor);
    }

    end() {
        this.dom.removeChild(this.wrap);
    }
}

Object.assign(EditState.prototype, hasToggle);

module.exports = EditState;
