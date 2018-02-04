const config = require('../config');

const KEY = 'neoputt-maps';

class Map {
    constructor(name = 'untitled', map = {}) {
        this.name = name || 'untitled';
        this.entities = map.entities;
        this.tiles = map.tiles;

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
            tiles: this.tiles
        };
    }

    saveToLocal() {
        let savedMaps = localStorage.getItem(KEY) || '{}';
        savedMaps = JSON.parse(savedMaps);

        const nameless = {...this};
        delete nameless.name;

        savedMaps[this.name] = nameless;

        localStorage.setItem('neoputt-maps', JSON.stringify(savedMaps));
    }

    static getLocalMaps() {
        let savedMaps = localStorage.getItem(KEY) || '{}';
        savedMaps = JSON.parse(savedMaps);

        const maps = Object.keys(savedMaps).sort().map(name => {
            return new Map(name, savedMaps[name])
        });

        return maps;
    }

    static getLocalMap(name) {
        let savedMap = localStorage.getItem(KEY) || '{}';
        savedMap = JSON.parse(savedMap);
        savedMap = savedMap[name];

        if (!savedMap) {
            throw new ReferenceError('no such map "' + name + '"');
        }

        return new Map(name, savedMap.tiles, savedMap.lines);
    }
}

module.exports = Map;
