const xhr = require('xhr');

function getLobbies(done) {
    xhr.get('/lobbies.json', {
        headers: { 'x-requested-with': 'xmlhttprequest' },
        json: true
    }, (err, res, body) => {
        if (err) {
            return done(err);
        }

        if (!/^2/.test(res.statusCode)) {
            return done(new Error(`${res.statusCode}: ${body}`));
        }

        done(null, body);
    });
}

module.exports = getLobbies;
