const config = require('./config');
const h = require('hyperscript');
const states = require('./lib/states');

// TO ANGLE: * 180 / Math.PI

class NeoPutt {
    constructor() {
        this.fps  = config.fps;
        this.isPaused = false;

        const width = (config.tileSize * config.width);
        const height = (config.tileSize * config.height);

        this.dom = h('.neoputt-wrap', {
            style: {
                height: `${height}px`,
                width: `${width}px`
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

    pause(toggle) {
        if (typeof toggle !== 'undefined') {
            this.isPaused = !!toggle;
            return;
        }

        if (this.isPaused) {
            this.isPaused = false;
            this.tick();
        } else {
            this.isPaused = true;
        }
    }

    tick() {
        this.state.tick();
        this.state.draw();

        if (!this.isPaused) {
            setTimeout(this.tickWrap, 1000 / this.fps);
        }
    }

    start() {
        this.setState('load');
        this.tick();
    }
}

const game = new NeoPutt();
document.body.appendChild(game.dom);
game.start();

const hash = window.location.hash || '';

if (hash !== '#debug') {
    return;
}

document.body.appendChild(h('hr'));

const fps = h('input', {
    min: 1,
    style: { width: '64px' },
    title: 'fps',
    type: 'number',
    value: 20
});

fps.addEventListener('change', () => {
    game.fps = Number(fps.value) || 20;
}, false);

document.body.appendChild(fps);
document.body.appendChild(h('span', ' '));

const pause = h('button', 'pause');

pause.addEventListener('click', () => {
    game.pause();
}, false);

document.body.appendChild(pause);

if (localStorage.getItem('neoputt-maps')) {
    const delMaps = h('button', 'delete maps');

    delMaps.addEventListener('click', () => {
        if (confirm('sure?')) {
            localStorage.setItem('neoputt-maps', '');
            window.location.reload(false);
        }
    }, false);

    document.body.appendChild(h('span', ' '));
    document.body.appendChild(delMaps);
}
