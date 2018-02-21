const FieldState = require('./states/field');
const config = require('../config');

function validateActions(course, actions) {
    const field = new FieldState({}, course);
    field.replay(actions);

    return field.ball.finished;
}

function validateName(name) {
    if (name.length > config.maxNameLength) {
        return false;
    }

    return true;
}

module.exports.actions = validateActions;
module.exports.name = validateName;
