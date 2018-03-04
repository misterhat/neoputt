const Lobby = require('./lobby');
const Peer = require('simple-peer');
const deleteLobby = require('./xhr/delete-lobby');
const getAnswer = require('./xhr/get-answer');
const getCourse = require('./xhr/get-course');
const objectHash = require('object-hash');
const packet = require('./packet');
const postLobby = require('./xhr/post-lobby');
const postOffer = require('./xhr/post-offer');

class LobbyServer extends Lobby {
    constructor(props = {}) {
        super(props);
        this.peers = new Set();
        this.waitingForSignal = false;
    }

    command(command, args) {
        if (command === 'start') {
            this.waitingForSignal = false;

            let startIn = 5;
            this.broadcast(`@gre@starting match in ${startIn}...`);

            const interval = setInterval(() => {
                startIn -= 1;

                if (startIn === 0) {
                    clearInterval(interval);
                    this.start();
                    return;
                }

                this.broadcast(`@gre@${startIn}...`);
            }, 1000);
        }
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

    start() {
        this.active = true;
        deleteLobby(this.id, (err) => {
            if (err) {
                return console.error(err);
            }
        });
    }
}

module.exports = LobbyServer;
