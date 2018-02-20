const emoji = require('node-emoji').emoji;
const h = require('hyperscript');
const pkg = require('../../package');
const courses = require('../../courses');

const BUTTON = 'button.neoputt-button';

class TitleState {
    constructor(game) {
        this.game = game;
        this.dom = game.dom;

        this.play = h(BUTTON, `${emoji.golfer} play`);
        this.edit = h(BUTTON, `${emoji.pencil} edit course`);
        this.online = h(BUTTON, `${emoji['earth_americas']} play w/ friends`);

        this.wrap = h('div',
            h('br'), h('br'),
            h('h1.neoputt-header', 'neoputt'),
            h('small.neoputt-small', `v.${pkg.version}`), h('br'), h('br'),
            this.play, h('br'),
            this.edit, h('br'),
            this.online, h('br'),
            h('br'),
            h('small.neoputt-small',
                `copyright zorian m  ${emoji['copyright']} ` +
                new Date().getFullYear(), h('br'),
                h('a.neoputt-link', { href: '/license.html' }, pkg.license)
            ));
    }

    start() {
        this.play.addEventListener('click', () => {
            this.game.setState('field', [ courses[0] ]);
        }, false);

        this.edit.addEventListener('click', () => {
            this.game.setState('pick');
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

module.exports = TitleState;
