const config = require('./config');

const TitleState = require('./lib/states/title');

// TO ANGLE: * 180 / Math.PI

class NeoPutt {
    constructor() {
        this.dom = document.createElement('div');
        this.dom.className = 'neoputt-wrap';
        this.dom.style.width = (config.tileSize * config.width) + 'px';
        this.dom.style.height = (config.tileSize * config.height) + 'px';

        this.tickWrap = () => this.tick();
    }

    setState(state) {
        if (this.state) {
            this.state.end();
        }

        this.state = state;
        this.state.start();
    }

    tick() {
        this.state.tick();
        this.state.draw();
        setTimeout(this.tickWrap, 100);
    }

    start() {
        this.setState(new TitleState(this));
        this.tick();
    }
}

const game = new NeoPutt();
document.body.appendChild(game.dom);
game.start();
