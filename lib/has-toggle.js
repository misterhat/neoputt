const emoji = require('node-emoji');

const CHECK = emoji.get('heavy_check_mark');
const MUL_X = emoji.get('heavy_multiplication_x');

const hasToggle = {
    toggleProperty(obj, prop, el, toggle) {
        if (typeof toggle === 'undefined') {
            toggle = !obj[prop];
        }

        obj[prop] = toggle;

        if (obj[prop]) {
            el.classList.add('neoputt-button-f');
            el.textContent = `${CHECK} ${prop}`;
        } else {
            el.classList.remove('neoputt-button-f');
            el.textContent = `${MUL_X} ${prop}`;
        }
    }
};

module.exports = hasToggle;
