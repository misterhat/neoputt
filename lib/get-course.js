const Course = require('./course');
const xhr = require('xhr');
const offlineCourses = require('../courses');

function getCourse(id, done) {
    if (typeof id === 'string') {
        return done(null, offlineCourses[id]);
    }

    xhr.get('/course.json?id=' + id, {
        headers: { 'x-requested-with': 'XMLHttpRequest' },
        json: true
    }, (err, res, body) => {
        if (err) {
            return done(err);
        }

        if (!/^2/.test(res.statusCode)) {
            return done(new Error(`${res.statusCode}: ${body}`));
        }

        done(null, new Course(body));
    });
}

module.exports = getCourse;
