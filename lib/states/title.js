const emoji = require('node-emoji');
const h = require('hyperscript');
const pkg = require('../../package');

class TitleState {
    constructor(game) {
        this.game = game;
        this.dom = game.dom;

        this.play = h('button.neoputt-button', emoji.get('golfer') + ' play');
        this.edit = h('button.neoputt-button', emoji.get('pencil') +
                      ' edit course');
        this.online = h('button.neoputt-button', emoji.get('earth_americas') +
                        ' play online');

        this.wrap = h('div',
            h('br'),
            h('h1.neoputt-header', 'neoputt'), h('br'),
            this.play, h('br'),
            this.edit, h('br'),
            this.online, h('br'),
            h('br'),
            h('small.neoputt-small', 'copyright ' + emoji.get('copyright') +
              ' ' + new Date().getFullYear() + ' ' + pkg.license));
    }

    start() {
        this.play.addEventListener('click', () => {
            this.game.setState('field');
        }, false);

        this.edit.addEventListener('click', () => {
            this.game.setState('pick');
        }, false);

        this.dom.appendChild(this.wrap);
        this.dom.style.backgroundImage = 'url(golf.svg)';
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
