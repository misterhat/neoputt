const config = require('../../config');
const emoji = require('node-emoji');
const h = require('hyperscript');

class PickState {
    constructor(game) {
        this.game = game;
        this.dom = game.dom;

        this.search = h('input.neoputt-input', {
            placeholder: 'search...',
            style: { width: (config.tileSize * 12) + 'px' },
            type: 'search',
        });
        this.newMap = h('button.neoputt-button',
                        emoji.get('lower_left_paintbrush') + ' new course');
        this.back = h('button.neoputt-button', emoji.get('back') + ' back');

        this.wrap = h('div',
            h('.neoputt-box', {
                style: { height: (config.tileSize * 15) + 'px' }
            },
                h('h3', emoji.get('file_cabinet') + ' offline courses'),
                this.mapView('course 1 is a longer title'),
                this.mapView('testing'),
                this.mapView('xxxxxx'),
                this.mapView('course 2'),
                h('hr'),
                h('h3', emoji.get('bust_in_silhouette') + ' my courses'),
                this.mapView('course 1'),
                this.mapView('impossible'),
                this.mapView('really easy'),
                h('hr'),
                h('h3', emoji.get('earth_americas') + ' online courses'),
                this.search,
                h('br'), h('br'),
                this.mapView('fc pee trap'),
                this.mapView('lethal lava land'),
                this.mapView('shifting sand lands')),
            this.newMap, this.back);
    }

    mapView(name, map) {
        const view = h('.neoputt-map', h('small.neoputt-map-name', name));

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
