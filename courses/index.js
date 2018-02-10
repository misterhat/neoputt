const Map = require('../lib/map');

const COURSES = [ require('./demo') ].map(c => {
    const name = c.name;
    delete c.name;

    return new Map(name, c);
});

module.exports = COURSES;
