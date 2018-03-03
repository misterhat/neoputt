const Lobby = require('./lobby');
const Peer = require('simple-peer');
const getAnswer = require('./get-answer');
const getCourse = require('./get-course');
const objectHash = require('object-hash');
const postLobby = require('./post-lobby');
const postOffer = require('./post-offer');

class LobbyServer extends Lobby {
    constructor(props = {}) {
        super(props);
        this.peers = new Set();
        this.waitingForSignal = false;
    }

    create(done) {
        this.postLobby((err) => {
            let courseId = this.courses[0];
            courseId = courseId.id === -1 ? courseId.name : courseId.id;
            getCourse(courseId, done);
        });
    }

    addPeer() {
	if (this.waitingForSignal || this.peers.size >= this.userLimit) {
	    return;
	}

	const peer = new Peer({ initiator: true, trickle: false });

        peer.on('connect', () => {
            console.log(':)');
        });

        this.serverMsg('waiting for new peer...');
	this.waitingForSignal = true;

	peer.on('signal', data => {
	    if (data.type !== 'offer') {
                return;
	    }

            const offerHash = objectHash(data);

            postOffer(this.id, data, (err) => {
                if (err) {
                    this.serverMsg('@red@error posting offer!');
                    return console.error(err);
                }

                this.fetchAnswer(offerHash, (err, answer) => {
                    if (err) {
                        this.serverMsg('@red@error fetching answer!');
                        return console.error(err);
                    }

                    peer.signal(answer);
                    this.serverMsg('@gre@peer connected!');

                    this.waitingForSignal = false;
                    this.peers.add(peer);

                    if (this.peers.size < this.userLimit) {
                        console.log('total peers %s/%s', this.peers.size,
                            this.userLimit);
                        this.addPeer();
                    }
                });
            });
	});
    }

    end() {
        this.waitingForSignal = false;
    }

    fetchAnswer(offer, done) {
        if (!this.waitingForSignal) {
            return;
        }

        getAnswer(offer, (err, answer) => {
            if (err) {
                return done(err);
            }

            if (answer) {
                return done(null, answer);
            }

            setTimeout(() => this.fetchAnswer(offer, done), 1000);
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

    say(msg) {
        this.log.push({ msg, nick: this.nick });
    }
}

module.exports = LobbyServer;
