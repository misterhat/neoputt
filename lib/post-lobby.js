const config = require('../config');
const xhr = require('xhr');

function postLobby(lobby, done) {
    lobby = Object.assign({}, lobby);
    lobby.courses = lobby.courses.map(course => course.name);

    xhr({
        body: JSON.stringify(lobby),
        headers: {
            'content-type': 'application/json',
            'x-requested-with': 'xmlhttprequest'
        },
        url: '/lobby',
        method: 'post'
    }, (err, res, body) => {
        if (err) {
            return done(err);
        }

        if (/^5/.test(res.statusCode)) {
            return done(new Error(`${res.statusCode}: ${body}`));
        }

        return done(null, body);
    });
}

module.exports = postLobby;
