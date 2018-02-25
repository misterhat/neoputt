const h = require('hyperscript');

class Header {
    constructor(dom) {
        this.dom = dom;

        this.head = h('h2.neoputt-header', { style: { position: 'absolute' } });
        this.head.addEventListener('click', () => this.remove(), false);
    }

    remove() {
        if (this.head && this.head.parentNode === this.dom) {
            this.dom.removeChild(this.head);
        }
    }

    update(text, colour = '#000') {
        if (this.head.parentNode !== this.dom) {
            this.dom.appendChild(this.head);
        }

        this.head.textContent = text;

        const x = (this.dom.offsetWidth / 2) - (this.head.offsetWidth / 2) +
            'px';
        const y = (this.dom.offsetHeight / 2) - (this.head.offsetHeight / 2) +
            'px';

        this.head.style.color = colour;
        this.head.style.left = x;
        this.head.style.top = y;

        if (this.headTimeout) {
            clearTimeout(this.headTimeout);
        }

        this.headTimeout = setTimeout(() => this.remove(), 2000);
    }
}

module.exports = Header;
