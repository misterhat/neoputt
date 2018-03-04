const Lobby = require('./lobby');
const Peer = require('simple-peer');
const getCourse = require('./get-course');
const getOffer = require('./get-offer');
const objectHash = require('object-hash');
const packet = require('./packet');
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

        this.peer.on('data', data => {
            data = packet.parse(data);
            console.log('recvd', data);

            switch (data.type) {
                case 'message':
                    this.serverMsg(data.message);
                    break;
            }
        });

        this.peer.once('error', (err) => {
            if (!calledBack) {
                done(err);
                calledBack = true;
            }
        });

        this.peer.on('connect', () => {
            this.serverMsg('@gre@connected to lobby!');
            this.peer.send(packet.pack({ type: 'nick', nick: this.nick }));

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

    say(message) {
        // TODO check peer connection
        this.peer.send(packet.pack({
            type: 'message',
            message
        }));
    }
}

module.exports = LobbyClient;
