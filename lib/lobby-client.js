const Lobby = require('./lobby');
const Peer = require('simple-peer');
const getCourse = require('./xhr/get-course');
const getOffer = require('./xhr/get-offer');
const objectHash = require('object-hash');
const packet = require('./packet');
const postAnswer = require('./xhr/post-answer');

const MAX_OFFERS = 10;

class LobbyClient extends Lobby {
    constructor(props = {}) {
        super(props);
        this.peer = new Peer({ trickle: false });
        this.offerAttempts = 0;
    }

    end() {
        this.peer.destroy();
    }

    fetchOffer(done) {
        this.offerAttempts += 1;

        getOffer(this.id, (err, offer) => {
            if (err) {
                return done(err);
            }

            if (offer) {
                return done(null, offer);
            }

            if (this.offerAttempts < MAX_OFFERS) {
                setTimeout(() => this.fetchOffer(done), 1000);
            } else {
                done(new Error('offer request limit reached'));
            }
        });
    }

    join(done) {
        let calledBack = false;

        this.peer.on('data', data => {
            data = packet.parse(data);
            console.log('recvd', data);

            switch (data.type) {
                case 'start':
                    break;
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

        this.peer.on('close', () => {
            this.serverMsg('@red@host peer disconnected. game over!');
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

    sendToServer(data) {
        if (this.peer.connected) {
            this.peer.send(packet.pack(data));
        }
    }

    say(message) {
        this.sendToServer({ type: 'message', message });
    }
}

module.exports = LobbyClient;
