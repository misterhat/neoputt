const pkg = require('../../package');

const emoji = require('node-emoji');
const h = require('hyperscript');

const FieldState = require('./field');

class TitleState {
    constructor(game) {
        this.game = game;
        this.dom = game.dom;

        this.play = h('button', emoji.get('golfer') + ' play');
        this.edit = h('button', emoji.get('pencil') + ' edit maps');
        this.withFriends = h('button', emoji.get('earth_americas') +
                             ' with friends');
    }

    start() {
        const buttons = h('div.neoputt-buttons', [
            this.play, h('br'),
            this.edit, h('br'),
            this.withFriends, h('br')
        ]);

        this.play.addEventListener('click', () => {
            this.game.setState(new FieldState(this.game));
        }, false);

        this.dom.style.backgroundImage = 'url(golf.svg)';

        this.dom.appendChild(h('br'));
        this.dom.appendChild(h('h1.neoputt-heading', 'neoputt'));
        this.dom.appendChild(h('br'));
        this.dom.appendChild(buttons);
        this.dom.appendChild(h('br'));
        this.dom.appendChild(h('small.neoputt-small', 'copyright ' +
                               emoji.get('copyright') + ' ' +
                                new Date().getFullYear() + ' ' + pkg.license));
    }

    tick() {
    }

    draw() {
    }

    end() {
        this.dom.style.backgroundImage = 'none';
        this.dom.innerHTML = '';
    }
}

module.exports = TitleState;
