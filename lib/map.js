const KEY = 'neoputt-maps';

class Map {
    constructor(name = '', tiles = [], lines = []) {
        this.lines = lines;
        this.name = name;
        this.tiles = tiles;
    }

    toJSON() {
        return {
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
        let savedMap = localStorage.getItem(KEY) || {};
        savedMap = savedMap[name];

        if (!savedMap) {
            throw new ReferenceError('no such map "' + name + '"');
        }

        return new Map(name, savedMap.tiles, savedMap.lines);
    }
}

module.exports = Map;
