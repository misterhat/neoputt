const xhr = require('xhr');

function getAnswer(offer, done) {
    xhr(`/signal/answer.json?offer=${offer}`, {
        headers: { 'x-requested-with': 'XMLHttpRequest' },
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

module.exports = getAnswer;
