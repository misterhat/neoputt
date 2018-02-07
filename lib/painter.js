const Ball = require('./entities/ball');
const Hole = require('./entities/hole');
const Magnet = require('./entities/magnet');
const TILES = require('./tiles');
const config = require('../config');

class Painter {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.imageSmoothingEnabled = false;
        this.ctx = canvas.getContext('2d');
        this.height = canvas.height;
        this.width = canvas.width;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawTile(tile, x, y) {
        this.ctx.fillStyle = TILES[tile].colour;
        this.ctx.fillRect(x * config.tileSize, y * config.tileSize,
            config.tileSize, config.tileSize);
    }

    drawTiles(tiles) {
        for (let i = 0; i < config.width; i += 1) {
            for (let j = 0; j < config.height; j += 1) {
                this.drawTile(tiles[i][j], i, j);
            }
        }
    }

    drawGrid() {
        this.ctx.setLineDash([4, 2]);

        for (let i = 0; i < config.width; i += 1) {
            const x = (i * config.tileSize) - 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        for (let i = 0; i < config.height; i += 1) {
            const y = (i * config.tileSize) - 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        this.ctx.setLineDash([]);
    }

    drawPreviewTile(tile, x, y) {
        this.ctx.globalAlpha = 0.75;
        this.ctx.fillStyle = tile;
        this.drawTile(tile, x, y);
        this.ctx.globalAlpha = 1;
    }

    drawPreviewLine(ball) {
        const head = config.tileSize / 2;
        const toX = (ball.strength * Math.cos(ball.angle)) + ball.x;
        const toY = (ball.strength * Math.sin(ball.angle)) + ball.y;

        this.ctx.beginPath();
        this.ctx.moveTo(ball.x, ball.y);
        this.ctx.lineTo(toX, toY);
        this.ctx.lineTo(toX - head * Math.cos(ball.angle - Math.PI / 6),
            toY - head * Math.sin(ball.angle - Math.PI / 6));
        this.ctx.lineTo(toX, toY);
        this.ctx.lineTo(toX - head * Math.cos(ball.angle + Math.PI / 6),
            toY - head * Math.sin(ball.angle + Math.PI / 6));
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();
        this.ctx.closePath();
    }

    drawBall(ball) {
        this.ctx.beginPath();
        this.ctx.arc(Math.floor(ball.x), Math.floor(ball.y), ball.radius, 0,
            2 * Math.PI);
        this.ctx.fillStyle = ball.colour;
        this.ctx.strokeStyle = '#000';
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawHole(hole) {
        this.ctx.beginPath();
        this.ctx.arc(hole.x, hole.y, hole.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#000';
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawMagnet(magnet) {
        this.ctx.drawImage(magnet.sprite, magnet.x, magnet.y);
    }

    drawEntity(entity) {
        if (entity instanceof Ball) {
            this.drawBall(entity);
        } else if (entity instanceof Hole) {
            this.drawHole(entity);
        } else if (entity instanceof Magnet) {
            this.drawMagnet(entity);
        }
    }
}

module.exports = Painter;
