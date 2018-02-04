const Cursor = require('../cursor');
const Editor = require('../editor');
const Map = require('../map');
const Painter = require('../painter')
const TILES = require('../tiles');
const config = require('../../config');
const emoji = require('node-emoji');
const h = require('hyperscript');

const CHECK = emoji.get('heavy_check_mark');
const MUL_X = emoji.get('heavy_multiplication_x');
const nbsp = String.fromCharCode(160);

class EditState {
    constructor(game, name = 'untitled', map = new Map()) {
        this.game = game;
        this.dom = game.dom;

        this.editor = new Editor(name, map);

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
            placeholder: 'name...',
            title: 'course name',
            type: 'text',
            value: this.editor.map.name || '',
        });

        this.save = h('button.neoputt-button',
                      emoji.get('floppy_disk') + ' save');
        this.upload = h('button.neoputt-button',
                        emoji.get('point_up_2') + ' upload');
        this.undo = h('button.neoputt-button',
                      emoji.get('leftwards_arrow_with_hook') + ' undo');
        this.redo = h('button.neoputt-button',
                      emoji.get('arrow_right_hook') + ' redo');
        this.useFill = h('button.neoputt-button');
        this.useGrid = h('button.neoputt-button');
        this.useClear = h('button.neoputt-button', emoji.get('gun') + ' clear');

        this.wrap = h('div', {
            style: { 'background-color': '#aaa' }
        },
            h('.neoputt-toolbox', {
                style: { height: (toolHeight - 6) + 'px' }
            },
                h('.neoputt-tools',
                    this.nameInput, this.save, this.upload, h('br'),
                    this.undo, this.redo, this.useFill, this.useGrid,
                    this.useClear),
                h('.neoputt-tiles', {
                    style: { width: (config.tileSize * 8) + 'px' }
                }, TILES.map(this.tileView.bind(this))),
                h('.neoputt-clear')),
            this.canvas,
            this.back,
            this.test);
    }

    tileView(tile, index) {
        const view = h('.neoputt-tile', {
            style: {
                'background-color': tile.colour,
                width: config.tileSize + 'px',
                height: config.tileSize + 'px'
            },
            title: tile.name
        });

        view.addEventListener('click', () => {
            this.editor.selectedTile = index;
        }, false);

        return view;
    }

    toggleProperty(prop, el, toggle) {
        if (typeof toggle === 'undefined') {
            toggle = !this.editor[prop];
        }

        this.editor[prop] = toggle;

        if (this.editor[prop]) {
            el.classList.add('neoputt-button-f');
            el.innerText = CHECK + ' ' + prop;
        } else {
            el.classList.remove('neoputt-button-f');
            el.innerText = MUL_X + ' ' + prop;
        }
    }

    setFill(toggle) {
        this.toggleProperty('fill', this.useFill, toggle);
    }

    setGrid(toggle) {
        this.toggleProperty('grid', this.useGrid, toggle);
    }

    start() {
        this.cursor.listen();

        this.nameInput.addEventListener('change', () => {
            // TODO regex
            this.editor.map.name = this.nameInput.value;
        });

        this.back.addEventListener('click', () => {
            this.game.setState('pick');
        });

        this.useFill.addEventListener('click', () => {
            this.setFill();
        });

        this.useGrid.addEventListener('click', () => {
            this.setGrid();
        });

        this.save.addEventListener('click', () => {
            this.editor.map.saveToLocal();
        });

        this.setFill(false);
        this.setGrid(true);

        this.dom.appendChild(this.wrap);
    }

    tick() {
        if (this.cursor.down) {
            const x = Math.floor(this.cursor.x / config.tileSize);
            const y = Math.floor(this.cursor.y / config.tileSize);
            this.editor.paint(x, y);
        }
    }

    draw() {
        this.painter.clear();

        this.painter.drawTiles(this.editor.map.tiles);

        const x = Math.floor(this.cursor.x / config.tileSize);
        const y = Math.floor(this.cursor.y / config.tileSize);

        this.painter.drawPreviewTile(this.editor.selectedTile, x, y);

        if (this.editor.grid) {
            this.painter.drawGrid();
        }
    }

    end() {
        this.dom.removeChild(this.wrap);
    }
}

module.exports = EditState;
