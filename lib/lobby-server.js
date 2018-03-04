const Lobby = require('./lobby');
const Peer = require('simple-peer');
const getAnswer = require('./get-answer');
const getCourse = require('./get-course');
const objectHash = require('object-hash');
const packet = require('./packet');
const postLobby = require('./post-lobby');
const postOffer = require('./post-offer');

class LobbyServer extends Lobby {
    constructor(props = {}) {
        super(props);
        this.peers = new Set();
        this.waitingForSignal = false;
    }

    broadcast(message) {
        this.serverMsg(message);

        for (const peer of this.peers) {
            peer.send(packet.pack({ message, type: 'message' }));
        }
    }

    create(done) {
        this.postLobby((err) => {
            this.serverMsg('lobby created! type ::start to begin the match.');

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

        peer.on('data', data => {
            data = packet.parse(data);

            switch (data.type) {
                case 'message':
                    this.broadcast(`@yel@${peer.nick}: ${data.message}`);
                    break;
                case 'nick':
                    const nick = data.nick;

                    if (!peer.nick) {
                        this.broadcast(`@gre@${nick} has joined!`);
                    } else {
                        this.broadcast(`${peer.nick} is now known as ${nick}.`);
                    }

                    peer.nick = nick;
                    break;
            }
        });

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

                    this.waitingForSignal = false;
                    peer.signal(answer);
                    this.peers.add(peer);

                    if (this.peers.size < this.userLimit) {
                        setTimeout(() => this.addPeer(), 1000);
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

    say(message) {
        this.broadcast(`@yel@${this.nick}: ${message}`);
    }
}

module.exports = LobbyServer;
