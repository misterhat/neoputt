const Course = require('./course');
const config = require('../config');
const entities = require('./entities');
const objectHash = require('object-hash');

const THROTTLE = config.coursePostThrottle * 1000;

function dbActions(db, log) {
    const actions = {};

    const insertCourse = (course, user, done) => {
        const name = course.name;
        const entityHash = course.entityHash;
        const tileHash = course.tileHash;

        course.entities = course.entities.map(entities.fromObj);
        course = new Course(course);

        db('neoputt_courses').insert({
            'entity_hash': entityHash,
            'tile_hash': tileHash,
            'user_agent': user.userAgent,
            course: JSON.stringify(course),
            created: Date.now(),
            ip: user.ip,
            name: name,
        }).asCallback(err => {
            if (err) {
                return done(err);
            }

            done(null, {
                message: 'successfully uploaded!',
                statusCode: 200
            });
        });
    };

    actions.getCourse = (id, done) => {
        db('neoputt_courses')
            .select('course', 'created', 'dislikes', 'id', 'likes', 'name')
            .where('id', id)
            .limit(1)
            .first()
            .asCallback(done);
    };

    actions.getCourses = (filters, done) => {
        if (!done) {
            done = filters;
            filters = {};
        }

        const name = filters.name;
        const query = db('neoputt_courses')
            .select('course', 'created', 'dislikes', 'id', 'likes', 'name');

        if (name) {
            query.where('name', 'like', `%${name}%`);
        }

        query.orderBy('created', 'desc');

        if (filters.page) {
            query.offset(filters.page * config.maxSearchCourses);
        }

        query.limit(config.maxSearchCourses);
        query.asCallback(done);
    };

    actions.getLobbies = (done) => {
        db('neoputt_lobbies')
            .select(
                'ball_hit as ballHit', 'courses', 'country', 'id', 'name',
                'user_limit as userLimit', 'users'
            )
            .where('hide', false)
            .orderBy('created', 'desc')
            .asCallback(done);
    };

    actions.saveCourse = (course, user, done) => {
        course.name = course.name.trim().toLowerCase();
        course.entityHash = entities.hash(course.entities);
        course.tileHash = objectHash(course.tiles);

        db('neoputt_courses')
            .select('created', 'name', 'entity_hash', 'tile_hash')
            .where({ name: course.name })
            .orWhere({
                'entity_hash': course.entityHash,
                'tile_hash': course.tileHash
            })
            .orWhere(function () {
                this.where('created', '>', Date.now() - THROTTLE)
                    .andWhere('ip', user.ip);
            })
            .first()
            .asCallback((err, res) => {
                if (err) {
                    return done(err);
                }

                if (res) {
                    const created = +(new Date(res.created));
                    const msg = { statusCode: 409 };

                    if (res.name === course.name) {
                        msg.message = 'name already taken';
                    } else if ((Date.now() - created) <= THROTTLE) {
                        const retry =
                            (THROTTLE - (Date.now() - created)) / 1000;
                        msg.statusCode = 429;
                        msg.headers = { 'retry-after': retry };
                        msg.message = 'slow down!';
                    } else {
                        msg.message = 'identical course found';
                    }

                    return done(null, msg);
                }

                insertCourse(course, user, done);
        });
    };

    actions.saveLobby = (lobby, user, done) => {
        // TODO validate courses
        db.transaction(trx => {
            return trx('neoputt_lobbies')
                .where({ ip: user.ip })
                .del()
                .then(() => {
                    return trx('neoputt_lobbies')
                        .insert({
                            'ball_hit': lobby.ballHit,
                            'turn_limit': lobby.turnLimit,
                            'user_limit': lobby.userLimit,
                            country: 'ca',
                            courses: JSON.stringify(lobby.courses),
                            created: Date.now(),
                            hide: lobby.hide,
                            ip: user.ip,
                            name: lobby.name
                        }, 'id');
                })
        }).asCallback(done);
    };

    return actions;
}

module.exports = dbActions;
