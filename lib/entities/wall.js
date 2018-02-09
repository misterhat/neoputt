const config = require('../../config');

const DEFAULTS = {
    height: config.tileSize,
    name: 'wall',
    sprite: '/img/brick.png',
    width: config.tileSize,
    x: 0,
    y: 0
};

class Wall {
    constructor(props = {}) {
        Object.keys(DEFAULTS).forEach(p => {
            this[p] = props[p] || DEFAULTS[p];
        });
    }

    ballCollision(ball) {
        /*if (collide.circleRect(ball, this)) {
            ball.colour = '#f0f';
        } else {
            ball.colour = '#fff';
        }*/
    }
}

module.exports = Wall;
