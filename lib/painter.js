const TILES = require('./tiles');
const config = require('../config');

class Painter {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.imageSmoothingEnabled = false;
        this.ctx = canvas.getContext('2d');
        this.height = canvas.height;
        this.images = {};
        this.width = canvas.width;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
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

    drawEditorMap(editor) {
        this.drawTiles(editor.map.tiles);
        this.drawEntities(editor.map.entities);

        if (editor.selectedEntity !== -1) {
            this.drawPreviewEntity(editor.selectedEntity);
        } else if (editor.selectedTile !== -1) {
            this.drawPreviewTile(editor.selectedTile, editor.cellX,
                editor.cellY);
        }

        if (editor.grid) {
            this.drawGrid();
        }
    }

    drawEntities(entities) {
        // for loop is still the fastest...
        for (let i = 0; i < entities.length; i += 1) {
            this.drawEntity(entities[i]);
        }
    }

    drawEntity(entity) {
        switch (entity.name) {
            case 'ball': return this.drawBall(entity);
            case 'hole': return this.drawHole(entity);
            default:
                if (entity.sprite) {
                    this.drawImage(entity.sprite, entity.x, entity.y);
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

    drawHole(hole) {
        this.ctx.beginPath();
        this.ctx.arc(hole.x, hole.y, hole.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#000';
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawImage(image, x, y) {
        if (!this.images[image]) {
            this.images[image] = new Image();
            this.images[image].src = image;
        }

        this.ctx.drawImage(this.images[image], x, y);
    }

    drawPreviewEntity(entity) {
        this.ctx.globalAlpha = 0.75;
        this.drawEntity(entity);
        this.ctx.globalAlpha = 1;
    }

    drawPreviewShot(ball) {
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

    drawPreviewTile(tile, x, y) {
        this.ctx.globalAlpha = 0.75;
        this.ctx.fillStyle = tile;
        this.drawTile(tile, x, y);
        this.ctx.globalAlpha = 1;
    }

    drawTile(id, x, y) {
        const tile = TILES[id];
        const drawX = x * config.tileSize;
        const drawY = y * config.tileSize;

        if (tile.colour) {
            this.ctx.fillStyle = tile.colour;
            this.ctx.fillRect(drawX, drawY, config.tileSize, config.tileSize);
        } else if (tile.sprite) {
            this.drawImage(tile.sprite, drawX, drawY);
        }
    }

    drawTiles(tiles) {
        for (let i = 0; i < config.width; i += 1) {
            for (let j = 0; j < config.height; j += 1) {
                this.drawTile(tiles[i][j], i, j);
            }
        }
    }
}

module.exports = Painter;
