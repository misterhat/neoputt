const Ball = require('./entities/ball');
const Bumper = require('./entities/bumper');
const Hole = require('./entities/hole');
const Magnet = require('./entities/magnet');
const Painter = require('./painter');
const Portal = require('./entities/portal');
const Wall = require('./entities/wall');
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
            this.entities = this.entities.map(e => {
                switch (e.name) {
                    case 'ball': return new Ball(e);
                    case 'bumper': return new Bumper(e);
                    case 'hole': return new Hole(e);
                    case 'magnet': return new Magnet(e);
                    case 'portal': return new Portal(e);
                    case 'wall': return new Wall(e);
                }
            });
        }
    }

    ballCollision(ball) {
        const cellX = Math.floor(ball.x / config.tileSize);
        const cellY = Math.floor(ball.y / config.tileSize);

        const tile = this.tiles[cellX][cellY];

        switch (tile) {
            case 0: // grass
                ball.friction = 0.96;
                break;
            case 1: // tall grass
                ball.friction = 0.94;
                break;
            case 2: // water
            case 6: // lava
                if (!ball.sinking) {
                    ball.dx = 0;
                    ball.dy = 0;
                    ball.sinking = true;
                    ball.x = (cellX * config.tileSize) + (config.tileSize / 2);
                    ball.y = (cellY * config.tileSize) + (config.tileSize / 2);
                }
                break;
            case 3: // ice
                ball.friction = 0.98;
                break;
            case 4: // sand
                ball.friction = 0.9;
                break;
            case 5: // dark sand
                ball.friction = 0.8;
                break;
            case 7: // acid
                if (Math.abs(ball.dx) < 2 && Math.abs(ball.dy) < 2 &&
                    !ball.sinking) {
                    ball.dx = 0;
                    ball.dy = 0;
                    ball.sinking = true;
                    ball.x = (cellX * config.tileSize) + (config.tileSize / 2);
                    ball.y = (cellY * config.tileSize) + (config.tileSize / 2);
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
