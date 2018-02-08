const Ball = require('./entities/ball');
const Hole = require('./entities/hole');
const Magnet = require('./entities/magnet');
const config = require('../config');

class Editor {
    constructor(map) {
        this.map = map;

        this.entities = [ new Ball(), new Hole(), new Magnet() ];
        this.fill = false;
        this.grid = true;
        this.redoHistory = [];
        this.selectedEntity = -1;
        this.selectedTile = 1;
        this.undoHistory = [];
        this.cellX = 0;
        this.cellY = 0;
    }

    clear() {
        this.map.initTiles();
    }

    setCellCoords(x, y) {
        this.cellX = Math.floor(x / config.tileSize);
        this.cellY = Math.floor(y / config.tileSize);
        this.cellX = this.cellX < 0 ? 0 : this.cellX;
        this.cellY = this.cellY < 0 ? 0 : this.cellY;
    }

    refreshEntityCoords() {
        if (this.selectedEntity !== -1) {
            this.selectedEntity.x = this.cellX * config.tileSize;
            this.selectedEntity.y = this.cellY * config.tileSize;

            if (this.selectedEntity.radius) {
                this.selectedEntity.x += 8;
                this.selectedEntity.y += 8;
            }
        }
    }

    selectEntity(index) {
        if (index !== -1) {
            this.selectedEntity = this.entities[index];
        } else {
            this.selectedEntity = -1;
        }
    }

    addEntity() {
        this.map.entities.push({ ...this.selectedEntity });
    }

    addTile() {
        this.map.tiles[this.cellX][this.cellY] = this.selectedTile;
    }

    tick() {
    }
}

module.exports = Editor;
