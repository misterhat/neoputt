const config = require('../../config');
const Map = require('../map');
const emoji = require('node-emoji');
const h = require('hyperscript');

class PickState {
    constructor(game) {
        this.game = game;
        this.dom = game.dom;

        this.search = h('input.neoputt-input', {
            placeholder: emoji.get('mag') + ' search...',
            style: { width: (config.tileSize * 12) + 'px' },
            type: 'search',
        });
        this.loadMore = h('button.neoputt-button',
                          emoji.get('heavy_plus_sign') + ' load more...');
        this.newMap = h('button.neoputt-button',
                        emoji.get('lower_left_paintbrush') + ' new course');
        this.back = h('button.neoputt-button', emoji.get('back') + ' back');

        let localMaps = Map.getLocalMaps();

        if (localMaps.length) {
            localMaps = Map.getLocalMaps().map(map => {
                return this.mapView(map, true);
            });
        } else {
            localMaps = h('small', emoji.get('disappointed') + ' you ' +
                          'haven\'t made any courses yet!');
        }

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
                localMaps,
                h('br'), h('br'),
                h('hr'),
                h('h3', emoji.get('earth_americas') + ' online courses'),
                this.search,
                h('br'), h('br'),
                this.mapView('fc pee trap'),
                this.mapView('lethal lava land'),
                this.mapView('shifting sand lands'), h('br'), h('br'),
                this.loadMore, h('br'), h('br')),
            this.newMap, this.back);
    }

    mapView(map, isOurs) {
        map = typeof map === 'string' ? new Map(map) : map;

        const view = h('.neoputt-map', h('small.neoputt-map-name', map.name));
        const viewListen = () => {
            this.game.setState('edit', [ map.name, map ]);
        }

        view.addEventListener('click', viewListen, false);

        if (isOurs) {
            const del = h('.neoputt-map-del', {
                title: 'delete ' + map.name
            }, emoji.get('wastebasket'));

            del.addEventListener('click', () => {
                view.removeEventListener('click', viewListen, false);
                const sure = confirm('are you sure you want to delete ' +
                                     map.name + '?');
                setTimeout(() => {
                    view.addEventListener('click', viewListen, false);
                }, 1);
            }, false);

            view.appendChild(del);
        }

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
