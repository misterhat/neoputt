const Painter = require('./painter');
const config = require('../config');
const h = require('hyperscript');
const lzwcompress = require('lzwcompress');

const KEY = 'neoputt-maps';

class Map {
    constructor(name = 'untitled', map = {}) {
        this.name = name || 'untitled';
        this.entities = map.entities;
        this.tiles = map.tiles;

        if (!this.tiles || this.tiles.length !== config.width) {
            this.initTiles();
        }

        if (!Array.isArray(this.entities)) {
            this.entities = [];
        } else {
            // instantiate each entitiy
        }
    }

    initTiles() {
        this.tiles = [];

        for (let i = 0; i < config.width; i += 1) {
            this.tiles.push([]);
            for (let j = 0; j < config.height; j += 1) {
                this.tiles[i].push(0);
            }
        }
    }

    toImage() {
        const canvas = h('canvas', {
            width: config.tileSize * config.width,
            height: config.tileSize * config.height
        });

        const painter = new Painter(canvas);
        painter.drawTiles(this.tiles);

        return canvas.toDataURL();
    }

    toJSON() {
        return {
            entities: this.entities,
            tiles: this.tiles
        };
    }

    saveToLocal() {
        let savedMaps = Map.getLocalMaps();
        savedMaps[this.name] = { ...this, name: undefined };
        localStorage.setItem('neoputt-maps', lzwcompress.pack(savedMaps));
    }

    deleteFromLocal() {
        let savedMaps = Map.getLocalMaps();
        delete savedMaps[this.name];
        localStorage.setItem('neoputt-maps', lzwcompress.pack(savedMaps));
    }

    static getLocalMaps() {
        let savedMaps = localStorage.getItem(KEY);

        if (savedMaps) {
            savedMaps = lzwcompress.unpack(savedMaps.split(',').map(Number));
        } else {
            savedMaps = {};
        }

        Object.keys(savedMaps).forEach(name => {
            savedMaps[name] = new Map(name, savedMaps[name]);
        });

        return savedMaps;
    }
}

module.exports = Map;
