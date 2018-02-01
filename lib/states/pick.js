const config = require('../../config');
const emoji = require('node-emoji');
const h = require('hyperscript');

class PickState {
    constructor(game) {
        this.game = game;
        this.dom = game.dom;

        this.newMap = h('button.neoputt-button',
                        emoji.get('lower_left_paintbrush') + ' new course');
        this.back = h('button.neoputt-button', emoji.get('back') + ' back');

        this.wrap = h('div',
            h('.neoputt-maps', {
                style: { height: (config.tileSize * 15) + 'px' }
            },
                h('h3', 'default courses'),
                this.mapView('course 1'),
                this.mapView('testing'),
                this.mapView('xxxxxx'),
                this.mapView('course 2'),
                h('hr'),
                h('h3', 'my courses'),
                this.mapView('course 1'),
                this.mapView('impossible'),
                this.mapView('really easy')),
            this.newMap, this.back);
    }

    mapView(name, map) {
        const view = h('.map', h('small.neoputt-small', name));

        view.addEventListener('click', () => {
            this.game.setState('edit', [ map, name]);
        }, false);

        return view;
    }

    start() {
        this.back.addEventListener('click', () => {
            this.game.setState('title');
        }, false);

        this.newMap.addEventListener('click', () => {
            this.game.setState('edit');
        }, false);

        this.dom.appendChild(this.wrap);
        this.dom.style.backgroundImage = 'url(golf.svg)';
    }

    tick() {
    }

    draw() {
    }

    end() {
        this.dom.removeChild(this.wrap);
        this.dom.style.backgroundImage = 'none';
    }
}

module.exports = PickState;
