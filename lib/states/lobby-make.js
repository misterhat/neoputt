const config = require('../../config');
const emoji = require('node-emoji').emoji;
const h = require('hyperscript');

class LobbyMakeState {
    constructor(game, lobby) {
        this.game = game;
        this.dom = game.dom;
        this.lobby = lobby;

        this.wrap = h('div',
            h('h2.neoputt-header', 'make lobby'));
    }

    start() {
        this.dom.appendChild(this.wrap);
    }

    tick() {
    }

    draw() {
    }

    end() {
        this.dom.removeChild(this.wrap);
    }
}

module.exports = LobbyMakeState;
