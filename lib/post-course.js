const xhr = require('xhr');

function postCourse(course, token, done) {
    xhr({
        body: JSON.stringify({ ...course.toJSON(), name: course.name, token }),
        headers: {
            'content-type': 'application/json',
            'x-requested-with': 'xmlhttprequest'
        },
        method: 'post',
        uri: '/course'
    }, (err, res, body) => {
        if (err) {
            return done(err);
        }

        if (/^5/.test(res.statusCode)) {
            return done(new Error(`${res.statusCode}: ${body}`));
        }

        try {
            body = JSON.parse(body);
        } catch (e) {
            return done(e);
        }

        done(null, body, res);
    });
}

module.exports = postCourse;
