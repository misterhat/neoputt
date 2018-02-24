const Course = require('../lib/course');

const courses = {
    'demo': require('./demo'),
    'ice': require('./ice')
};

Object.keys(courses).forEach(name => courses[name] = new Course(courses[name]));

module.exports = courses;
module.exports.order = [ courses.demo, courses.ice ];
