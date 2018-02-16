const Painter = require('./painter');
const config = require('../config');
const entities = require('./entities');
const h = require('hyperscript');
const lzwcompress = require('lzwcompress');

const KEY = 'neoputt-maps';

class Course {
    constructor(name = 'untitled', course = {}) {
        this.name = name || 'untitled';
        this.entities = course.entities;
        this.tiles = course.tiles;

        if (!this.tiles || this.tiles.length !== config.width) {
            this.initTiles();
        }

        if (!Array.isArray(this.entities)) {
            this.entities = [];
        } else {
            this.entities = this.entities.map(entities.fromObj);
        }
    }

    ballCollision(ball) {
        const cellX = Math.floor(ball.x / config.tileSize);
        const cellY = Math.floor(ball.y / config.tileSize);

        const tile = this.tiles[cellX][cellY];

        switch (tile) {
            case 0: // grass
                ball.friction = 0.95;
                break;
            case 1: // tall grass
                ball.friction = 0.92;
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
                    return tile;
                }
                return -1;
        }

        return tile;
    }

    deleteFromLocal() {
        let savedCourses = Course.getLocalCourses();
        delete savedCourses[this.name];
        localStorage.setItem(KEY, lzwcompress.pack(savedCourses));
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
        let savedCourses = Course.getLocalCourses();
        savedCourses[this.name] = { ...this, name: undefined };
        localStorage.setItem(KEY, lzwcompress.pack(savedCourses));
    }

    toImage(assets) {
        const canvas = h('canvas', {
            width: (config.tileSize * config.width) / 4,
            height: (config.tileSize * config.height) / 4
        });

        const painter = new Painter(canvas, assets, 0.25);
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

    validate() {
    }

    static getLocalCourses() {
        let savedCourses = localStorage.getItem(KEY);

        if (savedCourses) {
            savedCourses = savedCourses.split(',').map(Number);
            savedCourses = lzwcompress.unpack(savedCourses);
        } else {
            savedCourses = {};
        }

        Object.keys(savedCourses).forEach(name => {
            savedCourses[name] = new Course(name, savedCourses[name]);
        });

        return savedCourses;
    }
}

module.exports = Course;
