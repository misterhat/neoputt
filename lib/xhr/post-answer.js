const config = require('../../config');
const getToken = require('./get-token');
const xhr = require('xhr');

function postAnswer(offerHash, answer, done) {
    getToken((err, token) => {
        if (err) {
            return done(err);
        }

        answer.token = token;

        xhr({
            body: answer,
            headers: { 'x-requested-with': 'xmlhttprequest' },
            json: true,
            url: `/signal/answer?offer=${offerHash}`,
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

module.exports = postAnswer;
