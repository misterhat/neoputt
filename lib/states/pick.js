const Course = require('../course');
const SoundPlayer = require('../sound-player');
const config = require('../../config');
const emoji = require('node-emoji').emoji;
const getCourses = require('../get-courses');
const h = require('hyperscript');
const offlineCourses = require('../../courses');

const BUTTON = 'button.neoputt-button';
const PREV_WIDTH = (config.width * config.tileSize) / 4;

class PickState {
    constructor(game, type) {
        this.game = game;
        this.type = type;

        this.assets = game.assets;
        this.dom = game.dom;
        this.fetchedCourses = [];
        this.searchTerms = { page: 0 };
        this.soundPlayer = new SoundPlayer(this.assets);

        this.localCourses = h('div');
        this.search = h('input.neoputt-input', {
            placeholder: `${emoji.mag} search...`,
            style: { width: `${(config.tileSize * 12)}px` },
            type: 'search'
        });
        this.onlineCourses = h('div');
        this.loadPrevious = h(BUTTON, `${emoji.back} previous...`);
        this.loadMore = h(BUTTON, `${emoji['heavy_plus_sign']} more...`);
        this.newCourse = h(BUTTON,
            `${emoji['lower_left_paintbrush']} new course`);
        this.back = h(BUTTON, `${emoji.back} back`);

        const boxHeight = config.tileSize * 15;

        this.wrap = h('div',
            h('.neoputt-box', { style: { height: `${boxHeight}px` } },
                h('h3', `${emoji['file_cabinet']} offline courses`),
                offlineCourses.map(c => this.courseView(c)),
                h('br'), h('br'), h('hr'),
                h('h3', `${emoji['bust_in_silhouette']} my courses`),
                this.localCourses, h('br'), h('hr'),
                h('h3', `${emoji['earth_americas']} online courses`),
                this.search, h('br'), h('br'),
                this.loadPrevious, h('br'), h('br'),
                this.onlineCourses, h('br'),
                this.loadMore, h('br'), h('br')),
            (this.type === 'edit' ? this.newCourse : null), this.back);
    }

    refreshLocalCoursesView() {
        let views = this.localCoursesView();

        this.localCourses.innerHTML = '';

        if (!Array.isArray(views)) {
            views = [ views ];
        }

        views.forEach(view => this.localCourses.appendChild(view));
    }

    refreshOnlineCoursesView() {
        let views = this.onlineCoursesView();

        this.onlineCourses.innerHTML = '';

        if (!Array.isArray(views)) {
            views = [ views ];
        }

        views.forEach(view => this.onlineCourses.appendChild(view));
        this.refreshPageButtonsView();
    }

    refreshPageButtonsView() {
        this.loadPrevious.disabled = this.searchTerms.page < 1;
        this.loadMore.disabled =
            this.nextFetchedCourses < config.maxSearchCourses;
    }

    onlineCoursesView() {
        let onlineCourses = this.fetchedCourses;

        if (onlineCourses.length) {
            onlineCourses = onlineCourses.map(course => {
                return this.courseView(course.course);
            });
        } else {
            onlineCourses = h('small',
                `${emoji.disappointed} no courses with "`,
                h('em', this.searchTerms.name), '" present.');
        }

        return onlineCourses;
    }

    localCoursesView() {
        let localCourses = Course.getLocalCourses();
        const keys = Object.keys(localCourses);

        if (keys.length) {
            localCourses = keys.sort().map(name => {
                return this.courseView(localCourses[name], true);
            });
        } else {
            localCourses = h('small',
                `${emoji.disappointed} you haven't made any courses yet!`);
        }

        return localCourses;
    }

    courseView(course, isOurs) {
        const view = h('.neoputt-map', {
            style: {
                'background-image': `url(${course.toImage(this.assets)})`,
                width: `${PREV_WIDTH}px`
            }
        }, h('small.neoputt-map-name', course.name));

        const viewListen = () => {
            if (this.type === 'edit') {
                this.game.setState('edit', [ course ]);
            } else if (this.type === 'offline') {
                this.game.setState('field', [ course, 'offline' ]);
            }
        };

        view.addEventListener('click', viewListen, false);

        if (isOurs) {
            const del = h('.neoputt-map-del', {
                title: 'delete ' + course.name
            }, emoji.wastebasket);

            del.addEventListener('click', () => {
                view.removeEventListener('click', viewListen, false);

                const sure = window.confirm('are you sure you want to delete ' +
                    course.name + '?');

                if (sure) {
                    this.soundPlayer.play('crumple');
                    course.deleteFromLocal();
                    view.style.transition = 'linear transform 0.3s';
                    view.style.transform = 'scale(0)';
                    setTimeout(() => this.refreshLocalCoursesView(), 500);
                }

                setTimeout(() => {
                    view.addEventListener('click', viewListen, false);
                }, 1);
            }, false);

            view.appendChild(del);
        }

        return view;
    }

    repopulateOnlineCourses() {
        this.loadPrevious.disabled = true;
        this.loadMore.disabled = true;

        getCourses(this.searchTerms, (err, courses) => {
            if (err) {
                return;
            }

            this.fetchedCourses = courses;

            getCourses({
                ...this.searchTerms,
                page: this.searchTerms.page + 1
            }, (err, nextCourses) => {
                if (err) {
                    return;
                }

                this.nextFetchedCourses = nextCourses;
                this.refreshOnlineCoursesView();
            });
        });
    }

    start() {
        this.back.addEventListener('click', () => {
            this.game.setState('title');
        }, false);

        this.newCourse.addEventListener('click', () => {
            this.game.setState('edit');
        }, false);

        this.search.addEventListener('change', () => {
            this.searchTerms.name = this.search.value.trim();
            this.searchTerms.page = 0;
            this.repopulateOnlineCourses();
        }, false);

        this.loadPrevious.addEventListener('click', () => {
            this.searchTerms.page -= 1;
            this.repopulateOnlineCourses();
        }, false);

        this.loadMore.addEventListener('click', () => {
            this.searchTerms.page += 1;
            this.repopulateOnlineCourses();
        }, false);

        this.dom.appendChild(this.wrap);
        this.dom.style.backgroundImage = 'url(/img/background.svg)';

        this.refreshLocalCoursesView();
        this.repopulateOnlineCourses();
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
