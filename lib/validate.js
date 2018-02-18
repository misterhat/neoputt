const config = require('../config');

function validateName(name) {
    if (name.length > config.maxNameLength) {
        return false;
    }

    return true;
}

module.exports.name = validateName;
