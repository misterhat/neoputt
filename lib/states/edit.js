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

        this.editor = new Editor(map);

        this.test = h('button.neoputt-button.neoputt-edit-test',
            emoji.get('golf'), h('br'), nbsp + 'test' + nbsp);
        this.back = h('button.neoputt-button.neoputt-edit-back',
            emoji.get('back'), h('br'), 'back');

        const toolHeight = (config.tileSize * 5);

        this.coords = h('small.neoputt-edit-coords', {
            style: { top: (toolHeight + 4) + 'px' }
        });

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
            emoji.get('leftwards_arrow_with_hook') + ' undo');
        this.redo = h('button.neoputt-button',
            emoji.get('arrow_right_hook') + ' redo');
        this.useFill = h('button.neoputt-button');
        this.useGrid = h('button.neoputt-button');
        this.useClear = h('button.neoputt-button', emoji.get('gun') + ' clear');

        const tilesWidth = (config.tileSize * 8) + 'px';
        this.tiles = h('.neoputt-tiles', { style: { width: tilesWidth } },
            this.entitiesView(), h('br'),
            TILES.map(this.tileView.bind(this)));

        const fToolHeight = (toolHeight - 6) + 'px';

        this.wrap = h('div', { style: { 'background-color': '#aaa' } },
            h('.neoputt-toolbox', { style: { height: fToolHeight } },
                h('.neoputt-tools',
                    this.nameInput, this.save, this.upload, h('br'),
                    this.undo, this.redo, this.useFill, this.useGrid,
                    this.useClear),
                this.tiles,
                h('.neoputt-clear')),
            this.canvas,
            this.coords,
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
                'background-color': tile.colour,
                width: `${config.tileSize}px`,
                height: `${config.tileSize}px`
            },
            title: tile.name
        });

        view.addEventListener('click', () => {
            this.editor.selectEntity(-1);
            this.editor.selectedTile = index;

            for (let i = 0; i < this.tiles.children.length; i += 1) {
                const e = this.tiles.children[i];

                console.log(e, view);
                if (e === view) {
                    console.log('test');
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
        this.coords.innerHTML = `(${('00' + this.editor.cellX).slice(-2)}, ` +
            `${('00' + this.editor.cellY).slice(-2)})`;

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

        this.painter.drawTiles(this.editor.map.tiles);
        this.painter.drawEntities(this.editor.map.entities);

        if (this.editor.selectedEntity !== -1) {
            this.painter.drawPreviewEntity(this.editor.selectedEntity);
        } else if (this.editor.selectedTile !== -1) {
            this.painter.drawPreviewTile(this.editor.selectedTile,
                this.editor.cellX, this.editor.cellY);
        }

        if (this.editor.grid) {
            this.painter.drawGrid();
        }
    }

    end() {
        this.dom.removeChild(this.wrap);
    }
}

Object.assign(EditState.prototype, hasToggle);

module.exports = EditState;
