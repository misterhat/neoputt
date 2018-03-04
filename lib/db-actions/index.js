const courseDbActions = require('./course');
const lobbyDbActions = require('./lobby');
const signalDbActions = require('./signal');

function dbActions(db, log) {
    const actions = {};

    courseDbActions(actions, db, log);
    lobbyDbActions(actions, db, log);
    signalDbActions(actions, db, log);

    return actions;
}

module.exports = dbActions;
