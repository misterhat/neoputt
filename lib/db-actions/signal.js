const objectHash = require('object-hash');

function signalDbActions(actions, db, log) {
    actions.getAnswer = (offerHash, done) => {
        db('neoputt_peer_signals')
            .select('answer')
            .where('offer_hash', offerHash)
            .asCallback(done);
    };

    actions.getLatestOffer = (lobbyId, done) => {
        db('neoputt_peer_signals')
            .select('offer')
            .where({
                'lobby_id': lobbyId,
                answer: null
            })
            .sort('created', 'desc')
            .first()
            .asCallback(done);
    };

    actions.saveAnswer = (offerHash, answer, done) => {
        db('neoputt_peer_signals')
            .insert({ answer: JSON.stringify(answer) })
            .where({ 'offer_hash': offerHash })
            .asCallback(done);
    };

    actions.saveOffer = (lobbyId, offer, done) => {
        db('neoputt_peer_signals')
            .insert({
                'lobby_id': lobbyId,
                'offer_hash': objectHash(offer.offer),
                created: Date.now(),
                offer: JSON.stringify(offer)
            })
            .asCallback(done);
    };
}

module.exports = signalDbActions;
