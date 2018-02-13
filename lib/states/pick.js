const Course = require('../course');
const config = require('../../config');
const emoji = require('node-emoji');
const h = require('hyperscript');
const offlineCourses = require('../../courses');

const PREV_WIDTH = (config.width * config.tileSize) / 4;

class PickState {
    constructor(game) {
        this.game = game;
        this.dom = game.dom;

        this.localCourses = h('div');
        this.search = h('input.neoputt-input', {
            placeholder: emoji.get('mag') + ' search...',
            style: { width: (config.tileSize * 12) + 'px' },
            type: 'search',
        });
        this.loadMore = h('button.neoputt-button',
            emoji.get('heavy_plus_sign') + ' load more...');
        this.newCourse = h('button.neoputt-button',
            emoji.get('lower_left_paintbrush') + ' new course');
        this.back = h('button.neoputt-button', emoji.get('back') + ' back');

        const boxHeight = (config.tileSize * 15) + 'px';

        this.wrap = h('div',
            h('.neoputt-box', { style: { height: boxHeight } },
                h('h3', emoji.get('file_cabinet') + ' offline courses'),
                offlineCourses.map(c => this.courseView(c)),
                h('br'), h('br'), h('hr'),
                h('h3', emoji.get('bust_in_silhouette') + ' my courses'),
                this.localCourses,
                h('br'), h('hr'),
                h('h3', emoji.get('earth_americas') + ' online courses'),
                this.search,
                h('br'), h('br'),
                this.courseView('test'), this.courseView('another test'),
                this.courseView('three is enough'),
                h('br'), h('br'),
                this.loadMore, h('br'), h('br')),
            this.newCourse, this.back);
    }

    updateLocalCoursesView() {
        let views = this.localCoursesView();

        this.localCourses.innerHTML = '';

        if (!Array.isArray(views)) {
            views = [ views ];
        }

        views.forEach(view => this.localCourses.appendChild(view));
    }

    localCoursesView() {
        let localCourses = Course.getLocalCourses();
        const keys = Object.keys(localCourses);

        if (keys.length) {
            localCourses = keys.sort().map(name => {
                return this.courseView(localCourses[name], true);
            });
        } else {
            localCourses = h('small', emoji.get('disappointed') + ' you ' +
                          'haven\'t made any courses yet!');
        }

        return localCourses;
    }

    courseView(course, isOurs) {
        // TODO remove
        course= typeof course === 'string' ? new Course(course) : course;

        const view = h('.neoputt-map', {
            style: {
                'background-image': `url(${course.toImage()})`,
                width: `${PREV_WIDTH}px`
            }
        }, h('small.neoputt-map-name', course.name));

        const viewListen = () => {
            this.game.setState('edit', [ course ]);
        };

        view.addEventListener('click', viewListen, false);

        if (isOurs) {
            const del = h('.neoputt-map-del', {
                title: 'delete ' + course.name
            }, emoji.get('wastebasket'));

            del.addEventListener('click', () => {
                view.removeEventListener('click', viewListen, false);

                const sure = window.confirm('are you sure you want to delete ' +
                                            course.name + '?');

                if (sure) {
                    course.deleteFromLocal();
                    view.style.transition = 'linear transform 0.3s';
                    view.style.transform = 'scale(0)';
                    setTimeout(() => this.updateLocalCoursesView(), 500);
                }

                setTimeout(() => {
                    view.addEventListener('click', viewListen, false);
                }, 1);
            }, false);

            view.appendChild(del);
        }

        return view;
    }

    start() {
        this.back.addEventListener('click', () => {
            this.game.setState('title');
        }, false);

        this.newCourse.addEventListener('click', () => {
            this.game.setState('edit');
        }, false);

        this.dom.appendChild(this.wrap);
        this.dom.style.backgroundImage = 'url(/img/background.svg)';

        this.updateLocalCoursesView();
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

module.exports = PickState;
