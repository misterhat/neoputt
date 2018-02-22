const config = require('../../config');
const emoji = require('node-emoji').emoji;
const h = require('hyperscript');

class LobbyJoinState {
    constructor(game) {
        this.game = game;
        this.dom = game.dom;

        this.lobby = {
            courses: [],
            nick: ''
        };

        this.nickname = h('input.neoputt-input', {
            type: 'text',
            placeholder: `${emoji['bust_in_silhouette']} nickname...`
        });

        this.lobbies = h('table.neoputt-table',
            h('thead',
                h('tr',
                    h('th', { style: { width: '50%' } }, 'name'),
                    h('th', 'country'),
                    h('th', 'ball hit'),
                    h('th', 'users'))),
            h('tbody',
                h('tr',
                    h('td', 'test'),
                    h('td', emoji['flag-ca']),
                    h('td', emoji['heavy_multiplication_x']),
                    h('td', '9/10')),
                h('tr',
                    h('td', 'ball knockers hardcore'),
                    h('td', emoji['flag-ca']),
                    h('td', emoji['heavy_check_mark']),
                    h('td', '5/10')),
                h('tr',
                    h('td', '.:: Different Title :;.'),
                    h('td', emoji['flag-tr']),
                    h('td', emoji['heavy_multiplication_x']),
                    h('td', '3/4')),
                h('tr',
                    h('td', 'this is a longer title'),
                    h('td', emoji['flag-tm']),
                    h('td', emoji['heavy_check_mark']),
                    h('td', '7/10'))));

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

    start() {
        this.newLobby.addEventListener('click', () => {
            this.game.setState('pick', [ 'lobby', this.lobby ]);
        }, false);

        this.back.addEventListener('click', () => {
            this.game.setState('title');
        }, false);

        this.dom.appendChild(this.wrap);
        this.dom.style.backgroundImage = 'url(/img/background.svg)';
    }

    tick() {
    }

    draw() {
    }

    end() {
        this.dom.removeChild(this.wrap);
        this.dom.style.backgroundImage = 'none';
    }
}

module.exports = LobbyJoinState;
