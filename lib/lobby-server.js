const Lobby = require('./lobby');
const Peer = require('simple-peer');
const objectHash = require('object-hash');
const postLobby = require('./post-lobby');
const postOffer = require('./post-offer');

class LobbyServer extends Lobby {
    constructor(props = {}) {
        super(props); this.peers = new Set();
        this.waitingForSignal = false;
    }

    fetchAnswer() {
    }

    addPeer() {
	if (this.waitingForSignal || this.peers.size >= this.userLimit) {
	    return;
	}

	this.waitingForSignal = true;

	const peer = new Peer({ initiator: true, trickle: false });

	const offer = { offer: null, candidates: [] };
	let hasOffered = false;

	peer.on('signal', data => {
	    if (data.type === 'offer') {
		offer.offer = data;
	    } else if (data.candidate) {
		offer.candidates.push(data.candidate);
	    }

	    if (hasOffered) {
		return;
	    }

	    hasOffered = true;

	    setTimeout(() => {
		postOffer(this.id, offer, (err) => {
		    if (err) {
                        // emit error
			return console.error(err);
		    }

                    const offerHash = objectHash(offer.offer);

		    this.fetchAnswer(offerHash, (err, answer) => {
			if (err) {
                            // emit error
			    return console.error(err);
			}

			peer.signal(answer.answer);
			answer.candidates.forEach(candidate => {
			    peer.signal({ candidate });
			});

			this.waitingForSignal = false;
			this.generatePeer();
		    });
		});
	    }, 2000);
	});
    }

    postLobby(done) {
        postLobby(this, (err, id) => {
            if (err) {
                return done(err);
            }

            this.id = id;
            done();
        });
    }
}

module.exports = LobbyServer;
