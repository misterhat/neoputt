const config = require('../config');

const DEFAULTS = {
    active: false,
    ballHit: true,
    courses: [],
    hide: false,
    name: '',
    nick: '',
    turnLimit: config.turnLimit,
    userLimit: config.maxLobbyUsers
};

class Lobby {
    constructor(props = {}) {
        Object.keys(DEFAULTS).forEach(p => {
            this[p] = props[p] || DEFAULTS[p];
        });
    }
}

module.exports = Lobby;
