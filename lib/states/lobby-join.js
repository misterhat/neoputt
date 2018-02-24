const Course = require('../course'); // TODO remove
const Lobby = require('../lobby');
const config = require('../../config');
const emoji = require('node-emoji').emoji;
const getLobbies = require('../get-lobbies');
const h = require('hyperscript');
const hasHeader = require('../has-header');

class LobbyJoinState {
    constructor(game, lobby) {
        this.game = game;
        this.dom = game.dom;

        if (!lobby) {
            this.lobby = new Lobby();
        }

        this.fetchedLobbies = [];

        this.nickname = h('input.neoputt-input', {
            placeholder: `${emoji['bust_in_silhouette']} nickname...`,
            type: 'text'
        });

        this.lobbies = h('table.neoputt-table',
            h('thead',
                h('tr',
                    h('th', { style: { width: '50%' } }, 'name'),
                    h('th', 'country'),
                    h('th', 'ball hit'),
                    h('th', 'users'))),
            h('tbody'));

        this.newLobby = h('button.neoputt-button',
            `${emoji['lower_left_paintbrush']} new lobby`);
        this.joinRandom = h('button.neoputt-button',
            `${emoji.question} join random`);

        this.back = h('button.neoputt-button', `${emoji.back} back`);

        this.wrap = h('div',
            h('h2.neoputt-header', 'join lobby'), h('br'),
            this.nickname,
            h('.neoputt-table-wrap', {
                style: { height: '152px' }
            }, this.lobbies),
            this.newLobby, this.joinRandom, this.back);
    }

    joinLobby(lobby) {
        if (!this.lobby.nick.length) {
            this.updateHeader('pick a nickname!', '#b00');
            return;
        }

        this.game.setState('field', [ new Course(), 'lobby' ] );
    }

    refreshLobbyView() {
        this.lobbies.querySelector('tbody').innerHTML = '';

        this.fetchedLobbies.forEach(lobby => {
            const row = this.lobbies.insertRow(-1);

            row.addEventListener('click', () => {
                this.joinLobby(lobby);
            }, false);

            const name = row.insertCell(-1);
            name.innerText = lobby.name;

            const country = row.insertCell(-1);
            country.innerText = emoji[`flag-${lobby.country}`];

            const ballHit = row.insertCell(-1);

            if (lobby.ballHit) {
                ballHit.innerText = emoji['heavy_check_mark'];
            } else {
                ballHit.innerText = emoji['heavy_multiplication_x'];
            }

            const users = row.insertCell(-1);
            users.innerText = `${lobby.users}/${lobby.userLimit}`;
        });
    }

    repopulateLobbies() {
        getLobbies((err, lobbies) => {
            if (err) {
                this.updateHeader('sever error', '#b00');
                return;
            }

            this.fetchedLobbies = lobbies || [];
            this.refreshLobbyView();
        });
    }

    start() {
        this.nickname.addEventListener('change', () => {
            this.lobby.nick = this.nickname.value;
        }, false);

        this.newLobby.addEventListener('click', () => {
            this.game.setState('pick', [ 'lobby', this.lobby ]);
        }, false);

        this.joinRandom.addEventListener('click', () => {
            const length = this.fetchedLobbies.length;

            if (length) {
                const index = Math.floor(Math.random() * length);
                this.joinLobby(this.fetchedLobbies[index]);
            }
        }, false);

        this.back.addEventListener('click', () => {
            this.game.setState('title');
        }, false);

        this.dom.appendChild(this.wrap);
        this.dom.style.backgroundImage = 'url(/img/background.svg)';

        this.repopulateLobbies();
    }

    tick() {
    }

    draw() {
    }

    end() {
        this.removeHeader();
        this.dom.removeChild(this.wrap);
        this.dom.style.backgroundImage = 'none';
    }
}

Object.assign(LobbyJoinState.prototype, hasHeader);

module.exports = LobbyJoinState;