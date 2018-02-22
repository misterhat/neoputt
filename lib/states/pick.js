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
    constructor(game, type, lobby) {
        this.game = game;
        this.type = type;
        this.lobby = lobby;

        this.assets = game.assets;
        this.dom = game.dom;
        this.fetchedCourses = [];
        this.searchTerms = { page: 0 };
        this.soundPlayer = new SoundPlayer(this.assets);

        this.localCourses = h('div');
        this.search = h('input.neoputt-input', {
            placeholder: `${emoji.mag} search...`,
            style: { width: `${config.tileSize * 12}px` },
            type: 'search'
        });
        this.onlineCourses = h('div');
        this.loadPrevious = h(BUTTON, `${emoji.back} previous...`);
        this.loadMore = h(BUTTON, `${emoji['heavy_plus_sign']} more...`);
        this.newCourse = h(BUTTON,
            `${emoji['lower_left_paintbrush']} new course`);
        this.back = h(BUTTON, `${emoji.back} back`);

        const boxHeight = config.tileSize * 15;

        let lobbyChoicesWrap = null;

        if (this.type === 'lobby') {
            this.lobby.courses = [];
            this.lobbyChoices = h('div');
            lobbyChoicesWrap = h('div',
                h('h3', 'lobby choices'), this.lobbyChoices, h('br'), h('hr'));
            this.next = h(BUTTON, `${emoji['arrow_right']} next`);
        }

        const myCoursesWrap = h('div',
            h('h3', `${emoji['bust_in_silhouette']} my courses`),
            this.localCourses, h('br'), h('hr'));

        this.wrap = h('div',
            h('.neoputt-box', { style: { height: `${boxHeight}px` } },
                lobbyChoicesWrap,
                h('h3', `${emoji['file_cabinet']} offline courses`),
                offlineCourses.map(c => this.courseView(c)), h('br'), h('br'),
                h('hr'),
                (this.type !== 'lobby' ? myCoursesWrap : null),
                h('h3', `${emoji['earth_americas']} online courses`),
                this.search, h('br'), h('br'),
                this.loadPrevious, h('br'), h('br'),
                this.onlineCourses, h('br'),
                this.loadMore, h('br'), h('br')),
            (this.type === 'edit' ? this.newCourse : null),
            (this.type === 'lobby' ? this.next : null),
            this.back);
    }

    addLobbyChoice(course) {
        const courses = this.lobby.courses;

        for (let i = 0; i < courses.length; i += 1) {
            if (courses[i].name === course.name) {
                return;
            }
        }

        courses.push(course);
        this.refreshLobbyCoursesView();
    }

    removeLobbyChoice(course) {
        const courses = this.lobby.courses;

        for (let i = 0; i < courses.length; i += 1) {
            if (courses[i].name === course.name) {
                courses.splice(i, 1);
                this.refreshLobbyCoursesView();
                return;
            }
        }
    }

    refreshLobbyCoursesView() {
        let views = this.lobbyCoursesView();
        this.lobbyChoices.innerHTML = '';
        views = !Array.isArray(views) ? [ views ] : views;
        views.forEach(view => this.lobbyChoices.appendChild(view));
    }

    refreshLocalCoursesView() {
        let views = this.localCoursesView();
        this.localCourses.innerHTML = '';
        views = !Array.isArray(views) ? [ views ] : views;
        views.forEach(view => this.localCourses.appendChild(view));
    }

    refreshOnlineCoursesView() {
        let views = this.onlineCoursesView();
        this.onlineCourses.innerHTML = '';
        views = !Array.isArray(views) ? [ views ] : views;
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

    lobbyCoursesView() {
        if (this.lobby.courses.length) {
            return this.lobby.courses.map(course => {
                return this.courseView(course, false, true);
            });
        }

        return h('span', 'click courses below to add them to your lobby.');
    }

    localCoursesView() {
        let localCourses = Course.getLocalCourses();
        const keys = Object.keys(localCourses);

        if (keys.length) {
            return keys.sort().map(name => {
                return this.courseView(localCourses[name], true);
            });
        }

        return h('span',
            `${emoji.disappointed} you haven't made any courses yet!`);
    }

    courseView(course, isOurs = false, isLobby = false) {
        const view = h('.neoputt-map', {
            style: {
                'background-image': `url(${course.toImage(this.assets)})`,
                width: `${PREV_WIDTH}px`
            }
        }, h('small.neoputt-map-name', course.name));

        let viewListen;

        if (!isLobby) {
            viewListen = () => {
                switch (this.type) {
                    case 'edit':
                        this.game.setState('edit', [ course ]);
                        break;
                    case 'lobby':
                        this.addLobbyChoice(course);
                        break;
                    case 'offline':
                        this.game.setState('field', [ course, 'offline' ]);
                        break;
               }
            };
        } else {
            viewListen = () => {
                this.removeLobbyChoice(course);
            };
        }

        view.addEventListener('click', viewListen, false);

        if (this.type === 'edit' && isOurs) {
            const del = h('.neoputt-map-del', {
                title: `delete ${course.name} from browser`
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

            if (courses.length < config.maxSearchCourses) {
                this.nextFetchedCourses = [];
                this.refreshOnlineCoursesView();
                return;
            }

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

        if (this.type === 'lobby') {
            this.next.addEventListener('click', () => {
                this.game.setState('lobby-make', [ this.lobby ]);
            }, false);
        }

        this.newCourse.addEventListener('click', () => {
            this.game.setState('edit');
        }, false);

        this.back.addEventListener('click', () => {
            if (this.type === 'lobby') {
                this.game.setState('lobby-join');
            } else {
                this.game.setState('title');
            }
        }, false);

        this.dom.appendChild(this.wrap);
        this.dom.style.backgroundImage = 'url(/img/background.svg)';

        if (this.type === 'lobby') {
            this.refreshLobbyCoursesView();
        }

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
