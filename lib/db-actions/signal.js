const objectHash = require('object-hash');

function signalDbActions(actions, db, log) {
    actions.getAnswer = (offerHash, done) => {
        db('neoputt_peer_signals')
            .select('answer')
            .where('offer_hash', offerHash)
            .limit(1)
            .first()
            .asCallback((err, answer) => {
                if (err) {
                    return done(err);
                }

                done(null, answer ? answer.answer : null);
            });
    };

    actions.getLatestOffer = (lobbyId, done) => {
        db('neoputt_peer_signals')
            .select('offer')
            .where({ 'lobby_id': lobbyId, answer: null })
            .orderBy('created', 'desc')
            .first()
            .asCallback((err, offer) => {
                if (err) {
                    return done(err);
                }

                done(null, offer ? offer.offer : null);
            });
    };

    actions.saveAnswer = (offerHash, answer, done) => {
        db('neoputt_peer_signals')
            .update('answer', JSON.stringify(answer))
            .where('offer_hash', offerHash)
            .asCallback(done);
    };

    actions.saveOffer = (lobbyId, offer, done) => {
        db('neoputt_peer_signals')
            .insert({
                'lobby_id': lobbyId,
                'offer_hash': objectHash(offer),
                created: Date.now(),
                offer: JSON.stringify(offer)
            })
            .asCallback(done);
    };
}

module.exports = signalDbActions;
