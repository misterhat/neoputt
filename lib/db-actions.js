const entities = require('./entities');
const objectHash = require('object-hash');

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
            ip: user.ip,
            name: name,
        }).asCallback(err => {
            if (err) {
                log.error(err);
                return done(err);
            }

            done(null, {
                message: 'successfully saved course!',
                statusCode: 200
            });
        });
    };

    actions.saveCourse = (course, user, done) => {
        course.name = course.name.trim().toLowerCase();
        course.entityHash = entities.hash(course.entities);
        course.tileHash = objectHash(course.tiles);

        db('neoputt_courses').select('name', 'entity_hash', 'tile_hash')
            .where({ name: course.name })
            .orWhere({
                'entity_hash': course.entityHash,
                'tile_hash': course.tileHash
            })
            .first()
            .asCallback((err, res) => {
                if (res) {
                    let message = 'identical course found';

                    if (res.name === course.name) {
                        message = 'name is already taken';
                    }

                    return done(null, {
                        message: message,
                        statusCode: 409
                    });
                }

                insertCourse(course, user, done);
        });
    };

    return actions;
}

module.exports = dbActions;
