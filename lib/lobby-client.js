const Lobby = require('./lobby');
const Peer = require('simple-peer');
const getCourse = require('./get-course');
const getOffer = require('./get-offer');
const objectHash = require('object-hash');
const postAnswer = require('./post-answer');

class LobbyClient extends Lobby {
    constructor(props = {}) {
        super(props);
        this.peer = new Peer({ trickle: false });
    }

    fetchOffer(done) {
        getOffer(this.id, (err, offer) => {
            if (err) {
                return done(err);
            }

            if (offer) {
                return done(null, offer);
            }

            setTimeout(() => this.fetchOffer(done), 1000);
        });
    }

    join(done) {
        let calledBack = false;

        this.peer.once('error', (err) => {
            if (!calledBack) {
                done(err);
                calledBack = true;
            }
        });

        this.peer.on('connect', () => {
            this.serverMsg('@gre@connected to lobby!');

            if (!calledBack) {
                getCourse(this.courses[0], done);
                calledBack = true;
            }
        });

        this.fetchOffer((err, offer) => {
            if (err) {
                return done(err);
            }

            const offerHash = objectHash(offer);

            this.peer.on('signal', data => {
                if (data.type !== 'answer') {
                    return;
                }

                postAnswer(offerHash, data, (err) => {
                    if (err) {
                        if (!calledBack) {
                            done(err);
                            calledBack = true;
                        }

                        return;
                    }
                });
            });

            this.peer.signal(offer);
        });
    }
}

module.exports = LobbyClient;
