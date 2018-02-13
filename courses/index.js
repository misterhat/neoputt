const Course = require('../lib/course');

const COURSES = [ require('./demo') ].map(c => {
    const name = c.name;
    delete c.name;

    return new Course(name, c);
});

module.exports = COURSES;
