const config = require('./config');
const states = require('./lib/states');

// TO ANGLE: * 180 / Math.PI

class NeoPutt {
    constructor() {
        this.dom = document.createElement('div');
        this.dom.className = 'neoputt-wrap';

        const width = (config.tileSize * config.width);
        const height = (config.tileSize * config.height);

        this.dom.style.width = width + 'px';
        this.dom.style.height = height + 'px';
        this.dom.style.left = 'calc(50% - ' + (width / 2) + 'px)';
        this.dom.style.top = 'calc(50% - ' + (height / 2) + 'px)';
        this.dom.style.transform = 'scale(2)';

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

    start() {
        this.setState('title');
        this.tick();
    }
}

const game = new NeoPutt();
document.body.appendChild(game.dom);
game.start();
