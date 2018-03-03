const Course = require('./course');
const xhr = require('xhr');
const offlineCourses = require('../courses');

function getCourse(id, done) {
    if (typeof id === 'string') {
        return done(null, offlineCourses[id]);
    }

    xhr.get(`/course.json?id=${id}`, {
        headers: { 'x-requested-with': 'XMLHttpRequest' },
        json: true
    }, (err, res, body) => {
        if (err) {
            return done(err);
        }

        if (!/^2/.test(res.statusCode)) {
            return done(new Error(`${res.statusCode}: ${body}`));
        }

        let course;

        try {
            course = new Course(JSON.parse(body.course));
            course.name = body.name;
        } catch (e) {
            return done(e);
        }

        done(null, course);
    });
}

module.exports = getCourse;
