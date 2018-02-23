const config = require('../config');
const getToken = require('./get-token');
const xhr = require('xhr');

const ERROR = 'test and complete your course!'

function postCourse(course, done) {
    let actions = sessionStorage.getItem('neoputt-actions');

    if (!actions) {
        return done(null, ERROR, { statusCode: 409 });
    }

    try {
        actions = JSON.parse(actions);
    } catch (e) {
        return done(null, ERROR, { statusCode: 409 });
    }

    if (actions.name !== course.name) {
        return done(null, ERROR, { statusCode: 409 });
    }

    const payload = Object.assign({}, course.toJSON());
    payload.name = course.name;
    payload.actions = actions;

    getToken((err, token) => {
        if (err) {
            return done(err);
        }

        payload.token = token;

        xhr({
            body: payload,
            headers: { 'x-requested-with': 'xmlhttprequest' },
            json: true,
            method: 'post',
            uri: '/course'
        }, (err, res, body) => {
            if (err) {
                return done(err);
            }

            if (/^5/.test(res.statusCode)) {
                return done(new Error(`${res.statusCode}: ${body}`));
            }

            done(null, body, res);
        });
    });
}

module.exports = postCourse;
