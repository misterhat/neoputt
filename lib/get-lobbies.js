const xhr = require('xhr');

function getLobbies(done) {
    xhr.get('/lobbies.json', {
        headers: { 'x-requested-with': 'xmlhttprequest' }
    }, (err, res, body) => {
        if (err) {
            return done(err);
        }

        if (!/^2/.test(res.statusCode)) {
            return done(new Error(`${res.statusCode}: ${body}`));
        }

        try {
            body = JSON.parse(body);
        } catch (e) {
            return done(e);
        }

        done(null, body);
    });
}

module.exports = getLobbies;
