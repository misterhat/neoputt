const Peer = require('simple-peer');
const config = require('../../config');
const emoji = require('node-emoji').emoji;
const getCourse = require('../get-course');
const h = require('hyperscript');
const hasHeader = require('../has-header');
const postLobby = require('../post-lobby');

const FORM_INPUT = '.neoputt-form-input';
const LABEL = 'label.neoputt-label';
const PREV_WIDTH = (config.width * config.tileSize) / 4;

class LobbyMakeState {
    constructor(game, lobby) {
        this.game = game;
        this.assets = game.assets;
        this.dom = game.dom;
        this.lobby = lobby;

        this.nickname = h('input.neoputt-input', {
            placeholder: `${emoji['bust_in_silhouette']} nickname...`,
            type: 'text',
            value: this.lobby.nick
        });

        this.lobbyName = h('input.neoputt-input', {
            placeholder: `${emoji.golf} lobby name...`,
            type: 'text',
            value: this.lobby.name
        });

        this.ballHit =  h('input', { type: 'checkbox' });

        this.timeLimit = h('input.neoputt-input', {
            max: config.maxTurnLimit,
            min: config.minTurnLimit,
            style: { width: '64px' },
            type: 'number',
            value: this.lobby.turnLimit
        });

        this.userLimit = h('input.neoputt-input', {
            max: config.maxLobbyUsers,
            min: 2,
            style: { width: '64px' },
            type: 'number',
            value: this.lobby.userLimit
        });

        this.hide = h('input', { type: 'checkbox' });
        this.back = h('button.neoputt-button', `${emoji.back} back`);
        this.play = h('button.neoputt-button', `${emoji.golf} start`);

        this.wrap = h('div',
            h('h2.neoputt-header', 'make lobby'),
            h('.neoputt-box', {
                style: { height: '206px' }
            },
                h(FORM_INPUT, h(LABEL, 'nickname:', this.nickname)),
                h(FORM_INPUT,  h(LABEL, 'lobby name:', this.lobbyName)),
                h(FORM_INPUT, h(LABEL, 'ball collision:', this.ballHit)),
                h(FORM_INPUT, h(LABEL, 'time limit (s):', this.timeLimit)),
                h(FORM_INPUT, h(LABEL, 'user limit:', this.userLimit)),
                h(FORM_INPUT, h(LABEL, 'hide lobby:', this.hide)),
            h('hr'),
            h('h3', 'courses'),
            this.lobby.courses.map(course => {
                const url = `url(${course.toImage(this.assets)})`;

                return h('.neoputt-map', {
                    style: { 'background-image': url, width: PREV_WIDTH + 'px' }
                }, h('small.neoputt-map-name', course.name));
            }), h('br'), h('br')),
            this.play, this.back);
    }

    uploadLobby() {
        this.back.disabled = true;
        this.play.disabled = true;

        const reEnable = () => {
            this.back.disabled = false;
            this.play.disabled = false;
        };

        postLobby(this.lobby, (err, body, res) => {
            if (err) {
                this.updateHeader('server error', '#b00');
                reEnable();
                return;
            }

            let courseId = this.lobby.courses[0];
            courseId = courseId.id === -1 ? courseId.name : courseId.id;

            getCourse(courseId, (err, course) => {
                if (err) {
                    this.updateHeader('server error', '#b00');
                    reEnable();
                    return;
                }

                this.game.setState('field', [ course, 'lobby' ]);
            });
        });
    }

    start() {
        this.nickname.addEventListener('change', () => {
            this.lobby.nick = this.nickname.value;
        }, false);

        this.lobbyName.addEventListener('change', () => {
            this.lobby.name = this.lobbyName.value;
        }, false);

        this.ballHit.addEventListener('change', () => {
            this.lobby.ballHit = this.ballHit.checked;
        }, false);

        this.timeLimit.addEventListener('change', () => {
            this.lobby.turnLimit = +this.timeLimit.value;
        }, false);

        this.userLimit.addEventListener('change', () => {
            this.lobby.userLimit = +this.userLimit.value;
        }, false);

        this.hide.addEventListener('change', () => {
            this.lobby.hide = this.hide.checked;
        }, false);

        this.back.addEventListener('click', () => {
            this.game.setState('pick', [ 'lobby', this.lobby ]);
        }, false);

        this.play.addEventListener('click', () => {
            this.uploadLobby();
        }, false);

        this.dom.appendChild(this.wrap);
        this.dom.style.backgroundImage = 'url(/img/background.svg)';
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

Object.assign(LobbyMakeState.prototype, hasHeader);

module.exports = LobbyMakeState;
