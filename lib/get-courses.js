const Course = require('./course');
const querystring = require('querystring');
const xhr = require('xhr');

function getCourses(filters, done) {
    const url = '/courses.json?' + querystring.stringify(filters);

    xhr.get(url, {
        headers: { 'x-requested-with': 'xmlhttprequest' },
        json: true
    }, (err, res, body) => {
        if (err) {
            return done(err);
        }

        if (!/^2/.test(res.statusCode)) {
            return done(new Error(`${res.statusCode}: ${body}`));
        }

        let brokeOut = false;

        if (Array.isArray(body)) {
            body = body.map(course => {
                try {
                    course.course = JSON.parse(course.course);
                } catch (e) {
                    brokeOut = true;
                    return done(e);
                }

                course.course.name = course.name;
                course.course = new Course(course.course);
                return course;
            });
        }

        if (!brokeOut) {
            done(null, body);
        }
    });
}

module.exports = getCourses;
