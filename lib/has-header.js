const h = require('hyperscript');

const hasHeader = {
    removeHeader() {
        if (this.head && this.head.parentNode === this.dom) {
            this.dom.removeChild(this.head);
        }
    },

    updateHeader(text) {
        if (!this.head) {
            this.head = h('h2.neoputt-header', {
                style: { position: 'absolute' }
            });

            this.head.addEventListener('click', this.removeHeader.bind(this),
                false);
        }

        this.head.innerText = text;

        if (this.head.parentNode !== this.dom) {
            this.dom.appendChild(this.head);

            const x = this.head.style.left = (this.width / 2) -
                (this.head.offsetWidth / 2) + 'px';
            const y = this.head.style.top = (this.height / 4) -
                (this.head.offsetHeight / 2) + 'px';

            this.head.style.left = x;
            this.head.style.top = y;

            setTimeout(this.removeHeader.bind(this), 2000);
        }
    }
};

module.exports = hasHeader;
