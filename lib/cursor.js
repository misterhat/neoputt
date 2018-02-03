class Cursor {
    constructor(parent) {
        this.parent = parent;

        this.down = false;
        this.x = -1;
        this.y = -1;

        this.width = this.parent.width;
        this.height = this.parent.height;

        this.listeners = {
            mousedown: e => {
                if (e.button === 0) {
                    this.down = true;
                }
            },
            mouseup: e => {
                if (e.button === 0) {
                    this.down = false;
                }
            },
            mousemove: e => {
                const rect = this.parent.getBoundingClientRect();
                const scaleX = this.width / rect.width;
                const scaleY = this.height / rect.height;

                this.x = scaleX * (e.pageX - rect.left - window.scrollX);
                this.y = scaleY * (e.pageY - rect.top - window.scrollY);
            }
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
