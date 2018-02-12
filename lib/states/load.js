const assets = require('../../assets');
const h = require('hyperscript');
const preloader = require('preloader');

class LoadState {
    constructor(game) {
        this.game = game;
        this.dom = game.dom;

        this.progressBar = h('progress', {
            value: 0,
            max: 1
        });

        this.wrap = h('div',
            h('br'),
            h('h1', 'loading...'),
            h('br'),
            this.progressBar);
    }

    start() {
        this.dom.appendChild(this.wrap);

        const loader = preloader({});
        assets.forEach(loader.add.bind(loader));

        loader.on('progress', p => {
            this.progressBar.value = p;
        });

        loader.on('complete', () => {
            this.game.setState('title');
        });

        loader.load();
    }

    tick() {
    }

    draw() {
    }

    end() {
        this.dom.removeChild(this.wrap);
    }
}

module.exports = LoadState;
