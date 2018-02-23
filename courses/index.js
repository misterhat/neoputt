const Course = require('../lib/course');

const COURSES = [ require('./demo'), require('./ice') ].map(course => {
    return new Course(course);
});

module.exports = COURSES;
