class Cursor {
    constructor(parent) {
        this.parent = parent;

        this.down = false;
        this.rightDown = false;
        this.x = -1;
        this.y = -1;

        this.width = this.parent.width;
        this.height = this.parent.height;

        this.listeners = {
            contextmenu: e => {
                e.preventDefault();
            },
            mousedown: e => {
                if (e.button === 0) {
                    this.down = true;
                } else if (e.button === 2) {
                    this.rightDown = true;
                }
            },
            mouseleave: () => {
                this.down = false;
                this.rightDown = false;
            },
            mousemove: e => {
                const rect = this.parent.getBoundingClientRect();
                const scaleX = this.width / rect.width;
                const scaleY = this.height / rect.height;

                this.x = scaleX * (e.pageX - rect.left - window.scrollX);
                this.y = scaleY * (e.pageY - rect.top - window.scrollY);
            },
            mouseup: e => {
                if (e.button === 0) {
                    this.down = false;
                } else if (e.button === 2) {
                    this.rightDown = false;
                }
            },
        };
    }

    listen() {
        Object.keys(this.listeners).forEach(l => {
            this.parent.addEventListener(l, this.listeners[l]);
        });
    }

    end() {
        Object.keys(this.listeners).forEach(l => {
            this.parent.removeEventListener(l, this.listeners[l]);
        });
    }
}

module.exports = Cursor;
