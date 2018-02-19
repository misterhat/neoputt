const Ball = require('./ball');
const Bumper = require('./bumper');
const Hole = require('./hole');
const Magnet = require('./magnet');
const Portal = require('./portal');
const Wall = require('./wall');
const objectHash = require('object-hash');

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

function hash(entities) {
    return objectHash(entities.map(e => fromObj(e).toJSON()));
}

function sort(entities) {
    entities.sort((a, b) => {
        if (a.name > b.name) {
            return 1;
        } else if (b.name > a.name) {
            return -1;
        } else {
            return 0;
        }
    });
}

module.exports.fromObj = fromObj;
module.exports.hash = hash;
module.exports.sort = sort;
