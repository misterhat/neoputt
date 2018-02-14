const clone = require('clone');
const config = require('../config');
const deepEqual = require('deep-equal');
const entities = require('./entities');
const floodFill = require('n-dimensional-flood-fill');
const lzwcompress = require('lzwcompress');
const objectHash = require('object-hash');

const DEFAULTS = {
    fill: false,
    grid: true,
    name: null,
    redoHistory: [],
    undoHistory: [],
    selectedEntity: -1,
    selectedTile: 2
};
const KEY = 'neoputt-editor';
const LIMITS = {
    ball: 1
};
const UNDO_LIMIT = 10;

class Editor {
    constructor(course) {
        this.course = clone(course);

        this.cellX = 0;
        this.cellY = 0;
        this.cursorWasDown = false;
        this.entities = [
            { name: 'ball' }, { name: 'hole' }, { name: 'wall' },
            { name: 'bumper' }, { name: 'magnet' },
            { name: 'magnet', polarity: - 1 },
            { name: 'portal', colour: 'red' },
            { name: 'portal', colour: 'yellow' },
            { name: 'portal', colour: 'blue' }
        ].map(entities.fromObj);
        const len = this.entities.length - 1;
        this.entityCounts = {};
        this.fill = DEFAULTS.fill;
        this.grid = DEFAULTS.grid;
        this.redoHistory = [];
        this.selectedEntity = DEFAULTS.selectedEntity;
        this.selectedTile = DEFAULTS.selectedTile;
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

        for (const e of this.course.entities) {
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
        this.course.entities.push(clonedEntity);
    }

    addTile() {
        if (this.fill) {
            const toFill = floodFill({
                getter: (x, y) => this.course.tiles[x][y],
                seed: [this.cellX, this.cellY]
            }).flooded;

            toFill.forEach(loc => {
                this.course.tiles[loc[0]][loc[1]] = this.selectedTile;
            });
        } else {
            this.course.tiles[this.cellX][this.cellY] = this.selectedTile;
        }
    }

    clear() {
        this.redoHistory.length = 0;

        this.undoHistory.push({
            entities: clone(this.course.entities),
            tiles: clone(this.course.tiles)
        });

        this.course.entities.length = 0;
        this.course.entityCounts = {};
        this.course.initTiles();
    }

    redo() {
        const last = this.redoHistory.pop() || {};

        this.undoHistory.push({
            entities: clone(this.course.entities),
            tiles: clone(this.course.tiles)
        });

        if (last.entities) {
            this.course.entities = last.entities;
            this.refreshEntityCounts();
        }

        if (last.tiles) {
            this.course.tiles = last.tiles;
        }
    }

    cursorDown() {
        if (!this.cursorWasDown) {
            if (this.undoHistory.length >= UNDO_LIMIT) {
                this.undoHistory.splice(0, 1);
            }

            this.undoHistory.push({
                entities: clone(this.course.entities),
                tiles: clone(this.course.tiles)
            });
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
            isSameEntities = deepEqual(last.entities, this.course.entities);
        } else {
            isSameEntities = true;
        }

        if (last.tiles) {
            isSameTiles = deepEqual(last.tiles, this.course.tiles);
        } else {
            isSameTiles = true;
        }

        if (isSameEntities && isSameTiles) {
            this.undoHistory.pop();
        } else {
            this.redoHistory.length = 0;
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
        this.entityCounts = {};

        this.course.entities.forEach(e => {
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
        const last = this.undoHistory.pop();

        if (!last) {
            return;
        }

        this.redoHistory.push({
            entities: clone(this.course.entities),
            tiles: clone(this.course.tiles)
        });

        if (last.entities) {
            this.course.entities = last.entities;
            this.refreshEntityCounts();
        }

        if (last.tiles) {
            this.course.tiles = last.tiles;
        }
    }

    saveState() {
        this.state = this.state || {};
        Object.keys(DEFAULTS).forEach(p => this.state[p] = clone(this[p]));
        this.state.name = this.course.name;

        this.state.entityHash = objectHash(this.course.entities.map(e => {
            return entities.fromObj(e).toJSON();
        }));

        this.state.tileHash = objectHash(this.course.tiles);
        sessionStorage.setItem(KEY, lzwcompress.pack(this.state));
    }

    loadState() {
        let state = sessionStorage.getItem(KEY);

        if (state) {
            state = state.split(',').map(Number);
            state = lzwcompress.unpack(state);
        } else {
            state = clone(DEFAULTS);
            state.course = this.course;
        }

        this.grid = state.grid;
        this.fill = state.fill;
        this.selectedEntity = entities.fromObj(state.selectedEntity) || -1;
        this.selectedTile = state.selectedTile;

        const entityHash = objectHash(this.course.entities.map(e => {
            return entities.fromObj(e).toJSON();
        }));

        const tileHash = objectHash(this.course.tiles);

        if (state.name === this.course.name &&
            state.entityHash === entityHash &&
            state.tileHash === tileHash) {
            this.redoHistory = state.redoHistory.map(maps => {
                if (maps && maps.entities) {
                    maps.entities = maps.entities.map(entities.fromObj);
                }

                return maps;
            });

            this.undoHistory = state.undoHistory.map(maps => {
                if (maps && maps.entities) {
                    maps.entities = maps.entities.map(entities.fromObj);
                }

                return maps;
            });
        }

        this.state = state;
    }
}

module.exports = Editor;
