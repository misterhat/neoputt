const config = require('../config');

const KEY = 'neoputt-maps';

class Map {
    constructor(name = '', map = {}) {
        this.name = name;

        Object.keys(map).forEach(k => {
            this[k] = map[k];
        });

        if (!this.tiles || this.tiles.length !== config.width) {
            this.initTiles();
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

    }

    toJSON() {
        return {
            entities: this.entities,
            lines: this.lines,
            tiles: this.tiles
        };
    }

    saveToLocal() {
        let savedMaps = localStorage.getItem(KEY);

        if (savedMaps) {
            savedMaps = JSON.parse(savedMaps);
        } else {
            savedMaps = {};
        }

        savedMaps[name] = this;
        localStorage.setItem('neoputt-maps', JSON.stringify(savedMaps));
    }

    static loadFromLocal(name) {
        let savedMap = localStorage.getItem(KEY);

        if (savedMap) {
            savedMap = JSON.parse(savedMap);
        } else {
            savedMap = {};
        }

        savedMap = savedMap[name];

        if (!savedMap) {
            throw new ReferenceError('no such map "' + name + '"');
        }

        return new Map(name, savedMap.tiles, savedMap.lines);
    }
}

module.exports = Map;
