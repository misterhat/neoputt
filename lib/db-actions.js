function saveCourse(db, props, done) {
    const name = props.course.name;
    delete props.course.name;

    db('neoputt_courses').insert({
        'user_agent': props['user_agent'],
        course: JSON.stringify(props.course),
        ip: props.ip,
        name: name
    }).asCallback(done);
}

module.exports.saveCourse = saveCourse;
