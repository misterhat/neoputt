const config = require('../../config');
const emoji = require('node-emoji');
const h = require('hyperscript');

class EditState {
    constructor(game, map, name) {
        this.game = game;
        this.dom = game.dom;
        this.map = map;
        this.name = name;

        this.back = h('button.neoputt-button', {
            style: {
                bottom: '4px',
                height: '48px',
                position: 'absolute',
                right: '4px'
            }
        }, emoji.get('back'), h('br'), 'back');

        const toolHeight = (config.tileSize * 5);

        const oHeight = config.tileSize * config.height;
        const oWidth = config.tileSize * config.width;
        const sHeight = oHeight - toolHeight - 1;
        const sWidth = Math.floor((sHeight / oHeight) * oWidth);

        this.canvas = h('canvas', {
            height: oHeight,
            style: {
                height: sHeight + 'px',
                outline: '1px solid #000',
                width: sWidth + 'px'
            },
            width: oWidth
        });

        this.nameInput = h('input.neoputt-input', {
            placeholder: 'name...',
            title: 'course name',
            type: 'text',
            value: this.name || '',
        });

        this.save = h('button.neoputt-button', 'save');

        this.wrap = h('div',
            h('div', {
                style: {
                    'text-align': 'left',
                    height: toolHeight + 'px',
                    outline: '1px solid #000'
                }
            },
                this.nameInput,
                this.save,
                h('div', {
                    style: {
                        'overflow-y': 'scroll',
                        float: 'right',
                        height: '100%',
                        outline: '1px solid #000',
                        width: (config.tileSize * 8) + 'px'
                    }
                }, 'test')
            ),
            this.canvas,
            this.back
        );
    }

    start() {
        this.back.addEventListener('click', () => {
            this.game.setState('pick');
        });

        this.dom.appendChild(this.wrap);
    }

    tick() {
    }

    draw() {
    }

    end() {
        this.dom.removeChild(this.wrap);
    }
}

module.exports = EditState;
