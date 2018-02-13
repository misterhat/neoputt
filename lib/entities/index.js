const Ball = require('./ball');
const Bumper = require('./bumper');
const Hole = require('./hole');
const Magnet = require('./magnet');
const Portal = require('./portal');
const Wall = require('./wall');

function fromObj(obj) {
    switch (obj.name) {
        case 'ball': return new Ball(obj);
        case 'bumper': return new Bumper(obj);
        case 'hole': return new Hole(obj);
        case 'magnet': return new Magnet(obj);
        case 'portal': return new Portal(obj);
        case 'wall': return new Wall(obj);
    }
}

module.exports.fromObj = fromObj;
