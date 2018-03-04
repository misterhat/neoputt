const Header = require('../header');
const Lobby = require('../lobby');
const LobbyClient = require('../lobby-client');
const config = require('../../config');
const emoji = require('node-emoji').emoji;
const getLobbies = require('../xhr/get-lobbies');
const h = require('hyperscript');

class LobbyJoinState {
    constructor(game, lobby = new Lobby()) {
        this.game = game;
        this.dom = game.dom;
        this.lobby = lobby;

        this.fetchedLobbies = [];
        this.header = new Header(this.dom);
        this.joiningLobby = false;

        this.nickname = h('input.neoputt-input', {
            placeholder: `${emoji['bust_in_silhouette']} nickname...`,
            type: 'text',
            value: this.lobby.nick || ''
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
            h('h2.neoputt-header', 'join lobby'),
            this.nickname,
            h('.neoputt-table-wrap', {
                style: { height: '172px' }
            }, this.lobbies),
            this.newLobby, this.joinRandom, this.back);
    }

    joinLobby(lobby) {
        if (!this.joiningLobby && !this.lobby.nick.length) {
            this.header.update('pick a nickname!', '#b00');
            return;
        }

        if (this.joiningLobby) {
            return;
        }

        this.header.update('connecting to lobby...');

        this.joiningLobby = true;
        this.dom.style.cursor = 'wait';
        this.newLobby.disabled = true;
        this.joinRandom.disabled = true;
        this.back.disabled = true;

        const reEnable = () => {
            this.joiningLobby = false;
            this.dom.style.cursor = 'auto';
            this.newLobby.disabled = false;
            this.joinRandom.disabled = false;
            this.back.disabled = false;
        };

        lobby = new LobbyClient(lobby);
        lobby.nick = this.lobby.nick;

        lobby.join((err, course) => {
            if (err) {
                this.header.update('server error', '#b00');
                reEnable();
                return;
            }

            this.game.setState('field', [ course , 'lobby', lobby ]);
        });
    }

    refreshLobbyView() {
        this.lobbies.querySelector('tbody').innerHTML = '';

        this.fetchedLobbies.forEach(lobby => {
            const row = this.lobbies.insertRow(-1);

            row.addEventListener('click', () => {
                this.joinLobby(lobby);
            }, false);

            const name = row.insertCell(-1);
            name.textContent = lobby.name;

            const country = row.insertCell(-1);
            country.textContent = emoji[`flag-${lobby.country}`];

            const ballHit = row.insertCell(-1);

            if (lobby.ballHit) {
                ballHit.textContent = emoji['heavy_check_mark'];
            } else {
                ballHit.textContent = emoji['heavy_multiplication_x'];
            }

            const users = row.insertCell(-1);
            users.textContent = `${lobby.users}/${lobby.userLimit}`;
        });
    }

    repopulateLobbies() {
        getLobbies((err, lobbies) => {
            if (err) {
                this.header.update('sever error', '#b00');
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
        this.header.remove();
        this.dom.removeChild(this.wrap);
        this.dom.style.backgroundImage = 'none';
        this.dom.style.cursor = 'auto';
    }

}

module.exports = LobbyJoinState;
