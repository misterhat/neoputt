const h = require('hyperscript');

const hasHeader = {
    updateHeader(text) {
        if (!this.head) {
            this.head = h('h2.neoputt-header', {
                style: { position: 'absolute' }
            });

            this.dom.appendChild(this.head);
        }

        this.head.innerText = text;
        this.head.style.display = 'block';
        this.head.style.left = (this.width / 2) - (this.head.offsetWidth / 2) +
                               'px';
        this.head.style.top = (this.height / 4) - (this.head.offsetHeight / 2) +
                              'px';
        setTimeout(() => {
            this.head.style.display = 'none';
        }, 2000);
    }
};

module.exports = hasHeader;
