const config = require('../config');

const TILES = {
    0: '#0b0', // grass
    1: '#00b', // water
};

class Painter {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
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
        const head = 8;
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
