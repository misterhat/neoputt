const assets = require('./assets');
const config = require('./config');
const h = require('hyperscript');
const preloader = require('preloader');
const states = require('./lib/states');

// TO ANGLE: * 180 / Math.PI

class NeoPutt {
    constructor() {
        const width = (config.tileSize * config.width);
        const height = (config.tileSize * config.height);

        this.dom = h('.neoputt-wrap', {
            style: {
                width: width + 'px',
                height: height + 'px'
            }
        });

        this.tickWrap = () => this.tick();
    }

    setState(state, args = []) {
        if (this.state) {
            this.state.end();
        }

        args.unshift(this);
        args.unshift(null);

        this.state = new (Function.prototype.bind.apply(states[state], args));
        this.state.start();
    }

    tick() {
        this.state.tick();
        this.state.draw();
        setTimeout(this.tickWrap, 100);
    }

    start(done) {
        const loader = preloader({});

        assets.forEach(loader.add.bind(loader));

        loader.on('complete', () => {
            this.setState('title');
            this.tick();

            if (typeof done === 'function') {
                done();
            }
        });

        loader.load();
    }
}

const game = new NeoPutt();
document.body.appendChild(game.dom);
game.start();
