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
        }
    }

    ballTileCollisions(ball) {
        const cellX = Math.floor(ball.x / config.tileSize);
        const cellY = Math.floor(ball.y / config.tileSize);
        const toCellX = Math.floor((ball.x + ball.radius + ball.dx) /
            config.tileSize);
        const toCellY = Math.floor((ball.y + ball.radius + ball.dy) /
            config.tileSize);

        const tile = this.tiles[cellX][cellY];

        switch (tile) {
            case 0:
                ball.friction = 0.96;
                break;
            case 1: // wall
                break;
            case 2: // water
                if (!ball.sinking) {
                    ball.dx = 0;
                    ball.dy = 0;
                    ball.x = (cellX * config.tileSize) + ball.radius + 2;
                    ball.y = (cellY * config.tileSize) + ball.radius + 2;
                    ball.sinking = true;
                }
                break;
            case 3: // ice
                ball.friction = 0.98;
                break;
            case 4: // sand
                ball.friction = 0.8;
                break;
            case 5: // acid
                if (ball.dx < 2 && ball.dy < 2 && !ball.sinking) {
                    ball.dx = 0;
                    ball.dy = 0;
                    ball.x = (cellX * config.tileSize) + ball.radius + 2;
                    ball.y = (cellY * config.tileSize) + ball.radius + 2;
                    ball.sinking = true;
                }
                break;
        }
    }

    deleteFromLocal() {
        let savedMaps = Map.getLocalMaps();
        delete savedMaps[this.name];
        localStorage.setItem('neoputt-maps', lzwcompress.pack(savedMaps));
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

    saveToLocal() {
        let savedMaps = Map.getLocalMaps();
        savedMaps[this.name] = { ...this, name: undefined };
        localStorage.setItem('neoputt-maps', lzwcompress.pack(savedMaps));
    }

    toImage() {
        const canvas = h('canvas', {
            width: config.tileSize * config.width,
            height: config.tileSize * config.height
        });

        const painter = new Painter(canvas);
        painter.drawTiles(this.tiles);
        painter.drawEntities(this.entities);

        return canvas.toDataURL();
    }

    toJSON() {
        return {
            entities: this.entities,
            tiles: this.tiles
        };
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
