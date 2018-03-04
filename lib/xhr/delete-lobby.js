const getToken = require('./get-token');
const xhr = require('xhr');

function deleteLobby(lobbyId, done) {
    getToken((err, token) => {
        if (err) {
            return done(err);
        }

        xhr({
            body: { token: token },
            headers: { 'x-requested-with': 'xmlhttprequest' },
            json: true,
            url: `/lobby?id=${lobbyId}`,
            method: 'delete'
        }, (err, res, body) => {
            if (err) {
                return done(err);
            }

            if (!/^2/.test(res.statusCode)) {
                return done(new Error(`${res.statusCode}: ${body}`));
            }

            done(null, body);
        });
    });
}

module.exports = deleteLobby;
