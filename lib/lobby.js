const clone = require('clone');
const config = require('../config');
const sillyName = require('sillyname');

const DEFAULTS = {
    active: false,
    ballHit: true,
    courses: [],
    hide: false,
    id: -1,
    log: [],
    name: '',
    nick: '',
    turnLimit: config.turnLimit,
    userLimit: config.maxLobbyUsers
};

class Lobby {
    constructor(props = {}) {
        Object.keys(DEFAULTS).forEach(p => {
            this[p] = props[p] || clone(DEFAULTS[p]);
        });

        if (!this.nick || !this.nick.length) {
            this.nick = sillyName().toLowerCase();
        }
    }

    serverMsg(message) {
        this.log.push(message);
    }
}

module.exports = Lobby;
