const Ball = require('./entities/ball');
const Bumper = require('./entities/bumper');
const Hole = require('./entities/hole');
const Magnet = require('./entities/magnet');
const Portal = require('./entities/portal');
const Wall = require('./entities/wall');
const config = require('../config');

const LIMITS = {
    ball: 1
};
const P_COLOURS = [ 'red', 'pink', 'yellow', 'blue' ];

class Editor {
    constructor(map) {
        this.map = map;

        this.cellX = 0;
        this.cellY = 0;
        this.entities = [ new Ball(), new Hole(), new Wall(), new Bumper(),
            new Magnet(), new Portal(), new Portal(), new Portal(),
            new Portal() ];
        const len = this.entities.length - 1;
        P_COLOURS.forEach((c, i) => this.entities[len - i].colour = c);
        this.entityCounts = {};
        this.fill = false;
        this.grid = true;
        this.redoHistory = [];
        this.selectedEntity = -1;
        this.selectedTile = 1;
        this.undoHistory = [];

        this.refreshEntityCounts();
    }

    addEntity() {
        const e = this.selectedEntity;
        const count = this.entityCounts[e.name] || 0;
        const limit = LIMITS[e.name] || Infinity;

        if (count < limit) {
            this.entityCounts[e.name] = count + 1;
            this.map.entities.push({ ...e });
        }
    }

    addTile() {
        this.map.tiles[this.cellX][this.cellY] = this.selectedTile;
    }

    clear() {
        this.map.initTiles();
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

    refreshEntityCounts() {
        this.map.entities.forEach(e => {
            this.entityCounts[e.name] = (this.entityCounts[e.name] || 0) + 1;
        });
    }

    selectEntity(index) {
        if (index !== -1) {
            this.selectedEntity = this.entities[index];
        } else {
            this.selectedEntity = -1;
        }
    }

    setCellCoords(x, y) {
        this.cellX = Math.floor(x / config.tileSize);
        this.cellY = Math.floor(y / config.tileSize);
        this.cellX = this.cellX < 0 ? 0 : this.cellX;
        this.cellY = this.cellY < 0 ? 0 : this.cellY;
    }

    tick() {
    }
}

module.exports = Editor;
