const config = require('../config');
const tiles = require('./tiles');

const MAX_STRENGTH = config.tileSize * config.maxStrength;
const HEX_CHARS = '0123456789ABCDEF';

function getRandomColour() {
    let colour = '';

    for (let i = 0; i < 6; i++) {
        colour += HEX_CHARS[Math.floor(Math.random() * 16)];
    }

    return '#' + colour;
}

class Painter {
    constructor(canvas, assets, scale = 1) {
        this.canvas = canvas;
        this.assets = assets;

        this.ctx = canvas.getContext('2d');
        this.height = canvas.height;
        this.width = canvas.width;

        // for chat
        this.ctx.font = 'bold 12px Helvetica, sans-serif';

        // turns off anti-aliasing, resulting in a dramatic performance boost
        // and battery saving.
        this.canvas.imageSmoothingEnabled = false;

        // scale is used to generate preview map thumbnails.
        this.ctx.scale(scale, scale);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    // draw a pointed arrrow head >
    drawArrow(x, y, angle, size = config.tileSize / 2) {
        this.ctx.beginPath();
        this.ctx.lineTo(x - size * Math.cos(angle - Math.PI / 6),
            y - size * Math.sin(angle - Math.PI / 6));
        this.ctx.lineTo(x, y);
        this.ctx.lineTo(x - size * Math.cos(angle + Math.PI / 6),
            y - size * Math.sin(angle + Math.PI / 6));
        this.ctx.stroke();
        this.ctx.closePath();
    }

    drawBall(ball) {
        if (ball.radius <= 0) {
            return;
        }

        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(Math.floor(ball.x), Math.floor(ball.y), ball.radius, 0,
            2 * Math.PI);
        this.ctx.fillStyle = ball.colour;
        this.ctx.strokeStyle = '#000';
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.lineWidth = 1;
    }

    drawEditorCourse(editor) {
        this.drawTiles(editor.course.tiles);
        this.drawEntities(editor.course.entities);

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
            case 'magnet': return this.drawMagnet(entity);
            case 'portal':
                return this.drawImage(`/img/${entity.colour}-portal.png`,
                    entity.x, entity.y);
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
        this.ctx.drawImage(this.assets[image], x, y);
    }

    drawMagnet(magnet) {
        const half = config.tileSize / 2;
        this.ctx.translate(magnet.x + half, magnet.y + half);
        this.ctx.rotate(magnet.angle);
        this.drawImage(magnet.sprite, -half, -half);
        this.ctx.rotate(-magnet.angle);
        this.ctx.translate(-(magnet.x + half), -(magnet.y + half));
    }

    // draw a translucent entity to indicate its position before being added.
    drawPreviewEntity(entity) {
        this.ctx.globalAlpha = 0.75;
        this.drawEntity(entity);
        this.ctx.globalAlpha = 1;
    }

    // draw the lines indicating where the ball will shoot.
    drawPreviewShot(ball, shadow = false) {
        const toX = (ball.strength * Math.cos(ball.angle)) + ball.x;
        const toY = (ball.strength * Math.sin(ball.angle)) + ball.y;

        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([4, 8]);

        if (shadow) {
            this.ctx.strokeStyle = '#000';
        } else {
            this.ctx.strokeStyle = '#f00';
        }

        // draw a line back to the cursor to avoid disorientation
        if (ball.angleOffset) {
            const toOrigX = (ball.strength * Math.cos(ball.angle -
                ball.angleOffset)) + ball.x;
            const toOrigY = (ball.strength * Math.sin(ball.angle -
                ball.angleOffset)) + ball.y;
            this.ctx.beginPath();
            this.ctx.moveTo(ball.x, ball.y);
            this.ctx.lineTo(toOrigX, toOrigY);
            this.ctx.stroke();
            this.ctx.closePath();
        }

        this.ctx.beginPath();
        this.ctx.moveTo(ball.x, ball.y);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.setLineDash([]);
        this.drawArrow(toX, toY, ball.angle);
        this.ctx.lineWidth = 1;
    }

    // draw a translucent tile to indicate its position before being added.
    drawPreviewTile(tile, x, y) {
        this.ctx.globalAlpha = 0.75;
        this.ctx.fillStyle = tile;
        this.drawTile(tile, x, y);
        this.ctx.globalAlpha = 1;
    }

    drawTile(id, x, y) {
        const tile = tiles[id];
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

    drawEffectsText(text, x, y, colour) {
        const effectLookup = /\@[a-z]{3}\@/ig;

        const matches = text.match(effectLookup);

        if (matches) {
            const chunks = text.split(effectLookup);
            let offsetX = 0;

            this.drawText(chunks[0], x, y, colour);

            for (let i = 0; i < matches.length; i += 1) {
                let effect = matches[i].slice(1, -1);

                switch (effect) {
                    case 'blu':
                        effect = 'blue';
                        break;
                    case 'cya':
                        effect = 'cyan';
                        break;
                    case 'gre':
                        effect = 'green';
                        break;
                    case 'ora':
                        effect = 'orange';
                        break;
                    case 'ran':
                        effect = getRandomColour();
                        break;
                    case 'yel':
                        effect = 'yellow';
                        break;
                    case 'whi':
                        effect = 'white';
                        break;
                }

                offsetX += this.ctx.measureText(chunks[i]).width;
                this.drawText(chunks[i + 1], x + offsetX, y, effect);
            }
        } else {
            this.drawText(text, x, y, colour);
        }
    }

    drawText(text, x, y, colour = '#ff0') {
        this.ctx.fillStyle = '#000';
        this.ctx.fillText(text, x - 1, y - 1);
        this.ctx.fillStyle = colour;
        this.ctx.fillText(text, x, y);
    }

    drawChatLog(input, log) {
        this.drawEffectsText(input + '*', 6, this.height - 10, '#fff');

        for (let i = 0; i < 6; i += 1) {
            if (!log[log.length - i]) {
                continue;
            }

            const line = log[log.length - i];
            const colour = line.nick ? '#ff0' : '#fff';
            let display = line.nick ? `${line.nick}: ` : '';
            display += line.msg;

            this.drawEffectsText(display, 6, this.height - (i * 14) - 12,
                colour);
        }
    }
}

module.exports = Painter;
