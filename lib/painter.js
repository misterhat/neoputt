const config = require('../config');

const TILES = {
    0: '#0b0', // grass
    1: '#00b', // water
};

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

    drawTiles(tiles) {
        for (let i = 0; i < config.width; i += 1) {
            for (let j = 0; j < config.height; j += 1) {
                this.ctx.fillStyle = TILES[tiles[i][j]];
                this.ctx.fillRect(i * config.tileSize, j * config.tileSize,
                                  config.tileSize, config.tileSize);
            }
        }
    }

    drawGrid() {
        this.ctx.setLineDash([4, 2]);

        for (let i = 0; i < config.width; i += 1) {
            const x = (i * config.tileSize) + 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        for (let i = 0; i < config.height; i += 1) {
            const y = (i * config.tileSize) + 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        this.ctx.setLineDash([]);
    }

    drawPreviewTile(tile, x, y) {
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = tile;
        this.ctx.fillRect(x * config.tileSize, y * config.tileSize,
                          config.tileSize, config.tileSize);
        this.ctx.globalAlpha = 1;
    }

    drawBall(ball) {
        this.ctx.beginPath();
        this.ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#fff';
        this.ctx.strokeStyle = '#000';
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.closePath();
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

    drawHole(hole) {
        this.ctx.beginPath();
        this.ctx.arc(hole.x, hole.y, hole.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#000';
        this.ctx.fill();
        this.ctx.closePath();
    }
}

module.exports = Painter;
