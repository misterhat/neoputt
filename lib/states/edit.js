const emoji = require('node-emoji');
const h = require('hyperscript');

class EditState {
    constructor(game) {
        this.game = game;
        this.dom = game.dom;

        this.searchName = h('input', {
            type: 'text',
            placeholder: 'name...'
        });

        this.courses = h('.neoputt-maps',
            h('h3', 'default courses'),
            h('.map'),
            h('.map'),
            h('.map'),
            h('.map'),
            h('.map'),
            h('.map'),
            h('hr'),
            h('h3', 'my courses'),
            h('.map'),
            h('.map'),
            h('.map'),
            h('.map'),
            h('.map'),
            h('.map'),
        );

        this.newCourse = h('button', emoji.get('lower_left_paintbrush') +
                        ' new course');
        this.back = h('button', emoji.get('back') + ' back');
    }

    start() {
        this.back.addEventListener('click', () => {
            this.game.start();
        }, false);

        this.dom.style.backgroundImage = 'url(golf.svg)';

        this.dom.appendChild(this.courses);
        this.dom.appendChild(h('.neoputt-buttons', this.newCourse, this.back));
    }

    tick() {
    }

    draw() {
    }

    end() {
        this.dom.innerHTML = '';
        this.dom.style.backgroundImage = 'none';
    }
}

module.exports = EditState;
