const config = require('../../config');
const getToken = require('./get-token');
const xhr = require('xhr');

function postLobby(lobby, done) {
    lobby = Object.assign({}, lobby);
    lobby.courses = lobby.courses.map(course => {
        return course.id === -1 ? course.name : course.id;
    });

    getToken((err, token) => {
        if (err) {
            return done(err);
        }

        lobby.token = token;

        xhr({
            body: lobby,
            headers: { 'x-requested-with': 'xmlhttprequest' },
            json: true,
            url: '/lobby',
            method: 'post'
        }, (err, res, body) => {
            if (err) {
                return done(err);
            }

            if (/^5/.test(res.statusCode)) {
                return done(new Error(`${res.statusCode}: ${body}`));
            }

            done(null, body);
        });
    });
}

module.exports = postLobby;
