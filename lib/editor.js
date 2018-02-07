const Ball = require('./entities/ball');
const Hole = require('./entities/hole');
const Magnet = require('./entities/magnet');

class Editor {
    constructor(map) {
        this.map = map;

        this.entities = [ new Ball(), new Hole(), new Magnet() ];
        this.fill = false;
        this.grid = true;
        this.redoHistory = [];
        this.selectedTile = 2;
        this.undoHistory = [];
    }

    clear() {
        this.map.initTiles();
    }

    paint(x, y) {
        this.map.tiles[x][y] = this.selectedTile;
    }
}

module.exports = Editor;
