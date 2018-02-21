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

        delete course.name;
        delete course.entityHash;
        delete course.tileHash;

        course.entities = course.entities.map(entities.fromObj);

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
                    let msg = {
                        statusCode: 409
                    };

                    if (res.name === course.name) {
                        msg.message = 'name already taken';
                    } else if ((Date.now() - created) <= THROTTLE) {
                        msg.statusCode = 429;
                        msg.headers = {
                            'retry-after': (THROTTLE - (Date.now() - created)) / 1000
                        };
                        msg.message = 'slow down!';
                    } else {
                        msg.message = 'identical course found';
                    }

                    return done(null, msg);
                }

                insertCourse(course, user, done);
        });
    };

    return actions;
}

module.exports = dbActions;
