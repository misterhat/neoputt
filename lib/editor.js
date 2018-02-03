class Editor {
    constructor() {
        this.fill = false;
        this.grid = true;
        this.tiles = [ 'url(ball.png)', 'url(line.png)', '#0b0', '#00b', '#0bb',
                       '#bb0', '#000', '#ff0' ];
        this.selected = 0;
    }
}

module.exports = Editor;
