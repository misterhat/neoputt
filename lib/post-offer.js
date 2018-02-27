const config = require('../config');
const getToken = require('./get-token');
const xhr = require('xhr');

function postOffer(lobbyId, offer, done) {
    getToken((err, token) => {
        if (err) {
            return done(err);
        }

        offer.token = token;

        xhr({
            body: offer,
            headers: { 'x-requested-with': 'xmlhttprequest' },
            json: true,
            url: `/signal/offer?lobby=${lobbyId}`,
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

module.exports = postOffer;
