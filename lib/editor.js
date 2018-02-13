const Ball = require('./entities/ball');
const Bumper = require('./entities/bumper');
const Hole = require('./entities/hole');
const Magnet = require('./entities/magnet');
const Portal = require('./entities/portal');
const Wall = require('./entities/wall');
const clone = require('clone');
const config = require('../config');
const deepEqual = require('deep-equal');

const LIMITS = {
    ball: 1
};

class Editor {
    constructor(map) {
        this.map = map;

        this.cellX = 0;
        this.cellY = 0;
        this.cursorWasDown = false;
        this.entities = [ new Ball(), new Hole(), new Wall(), new Bumper(),
            new Magnet(), new Magnet({ polarity: -1 }),
            new Portal({ colour: 'red' }), new Portal({ colour: 'yellow' }),
            new Portal({ colour: 'blue' }) ];
        const len = this.entities.length - 1;
        this.entityCounts = {};
        this.fill = false;
        this.grid = true;
        this.redoHistory = [];
        this.selectedEntity = -1;
        this.selectedTile = 2;
        this.undoHistory = [];

        this.refreshEntityCounts();
    }

    addEntity() {
        const sE = this.selectedEntity;
        const count = this.entityCounts[sE.name] || 0;
        const limit = LIMITS[sE.name] || Infinity;
        let portals = {};

        if (count >= limit) {
            return;
        }

        let clonedEntity;

        for (const e of this.map.entities) {
            const eCellX = Math.floor(e.x / 16);
            const eCellY = Math.floor(e.y / 16);
            const sECellX = Math.floor(sE.x / 16);
            const sECellY = Math.floor(sE.y / 16);

            if (eCellX === sECellX && eCellY === sECellY) {
                return;
            }

            if (sE.name === 'portal' && e.name === 'portal' &&
                sE.colour === e.colour) {
                portals.colour = (portals.colour || 0) + 1;

                if (portals.colour >= 2) {
                    return;
                }

                clonedEntity = { ...sE, toX: e.x + 8, toY: e.y + 8};
                e.toX = sE.x + 8;
                e.toY = sE.y + 8;
            }
        }

        if (!clonedEntity) {
            clonedEntity = { ...sE };
        }

        this.entityCounts[sE.name] = count + 1;
        this.map.entities.push(clonedEntity);
    }

    addTile() {
        this.map.tiles[this.cellX][this.cellY] = this.selectedTile;
    }

    clear() {
        this.map.entities.length = 0;
        this.map.entityCounts = {};
        this.map.initTiles();
        this.undoHistory.push({
            entities: clone(this.map.entities)
        });
    }

    cursorDown(wasDown) {
        if (!this.cursorWasDown) {
            const last = this.undoHistory[this.undoHistory.length - 1] || {};

            if (this.selectedEntity !== -1) {
                this.undoHistory.push({ entities: clone(this.map.entities) });
            } else if (this.selectedTile !== -1) {
                this.undoHistory.push({ tiles: clone(this.map.tiles) });
            }
        }

        if (this.selectedEntity !== -1) {
            this.addEntity();
        } else if (this.selectedTile !== -1) {
            this.addTile();
        }

        this.cursorWasDown = true;
    }

    cursorUp() {
        const last = this.undoHistory[this.undoHistory.length - 1] || {};
        let isSameEntities, isSameTiles;

        if (last.entities) {
            isSameEntities = deepEqual(last.entities, this.map.entities);
        } else {
            isSameEntities = true;
        }

        if (last.tiles) {
            isSameTiles = deepEqual(last.tiles, this.map.tiles);
        } else {
            isSameTiles = true;
        }

        if (isSameEntities && isSameTiles) {
            this.undoHistory.pop();
        }

        this.cursorWasDown = false;
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

    undo() {
        const last = this.undoHistory.pop() || {};

        if (last.entities) {
            this.map.entities = clone(last.entities);
            this.refreshEntityCounts();
        }

        if (last.tiles) {
            this.map.tiles = clone(last.tiles);
        }
    }
}

module.exports = Editor;
