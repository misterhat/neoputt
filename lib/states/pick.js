const Map = require('../map');
const config = require('../../config');
const emoji = require('node-emoji');
const h = require('hyperscript');
const offlineCourses = require('../../courses');

const PREV_WIDTH = (config.width * config.tileSize) / 4;

class PickState {
    constructor(game) {
        this.game = game;
        this.dom = game.dom;

        this.localMaps = h('div');
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

        const boxHeight = (config.tileSize * 15) + 'px';

        this.wrap = h('div',
            h('.neoputt-box', { style: { height: boxHeight } },
                h('h3', emoji.get('file_cabinet') + ' offline courses'),
                offlineCourses.map(c => this.mapView(c)),
                h('br'), h('br'), h('hr'),
                h('h3', emoji.get('bust_in_silhouette') + ' my courses'),
                this.localMaps,
                h('br'), h('hr'),
                h('h3', emoji.get('earth_americas') + ' online courses'),
                this.search,
                h('br'), h('br'),
                this.mapView('test'), this.mapView('another test'),
                this.mapView('three is enough'),
                h('br'), h('br'),
                this.loadMore, h('br'), h('br')),
            this.newMap, this.back);
    }

    updateLocalMapsView() {
        let views = this.localMapsView();

        this.localMaps.innerHTML = '';

        if (!Array.isArray(views)) {
            views = [ views ];
        }

        views.forEach(view => this.localMaps.appendChild(view));
    }

    localMapsView() {
        let localMaps = Map.getLocalMaps();
        const keys = Object.keys(localMaps);

        if (keys.length) {
            localMaps = keys.sort().map(name => {
                return this.mapView(localMaps[name], true);
            });
        } else {
            localMaps = h('small', emoji.get('disappointed') + ' you ' +
                          'haven\'t made any courses yet!');
        }

        return localMaps;
    }

    mapView(map, isOurs) {
        // TODO remove
        map = typeof map === 'string' ? new Map(map) : map;

        const view = h('.neoputt-map', {
            style: {
                'background-image': `url(${map.toImage()})`,
                width: `${PREV_WIDTH}px`
            }
        }, h('small.neoputt-map-name', map.name));

        const viewListen = () => {
            this.game.setState('edit', [ map ]);
        };

        view.addEventListener('click', viewListen, false);

        if (isOurs) {
            const del = h('.neoputt-map-del', {
                title: 'delete ' + map.name
            }, emoji.get('wastebasket'));

            del.addEventListener('click', () => {
                view.removeEventListener('click', viewListen, false);

                const sure = window.confirm('are you sure you want to delete ' +
                                            map.name + '?');

                if (sure) {
                    map.deleteFromLocal();
                    view.style.transition = 'linear transform 0.3s';
                    view.style.transform = 'scale(0)';
                    setTimeout(() => this.updateLocalMapsView(), 500);
                }

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
        this.dom.style.backgroundImage = 'url(/img/background.svg)';

        this.updateLocalMapsView();
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
