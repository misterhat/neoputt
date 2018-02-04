class Editor {
    constructor(name, map) {
        this.map = map;
        this.map.name = name;

        this.fill = false;
        this.entities = [ 'url(ball.png)', 'url(line.png)' ];
        this.grid = true;
        this.selectedTile = 2;
    }

    paint(x, y) {
        this.map.tiles[x][y] = this.selectedTile;
    }
}

module.exports = Editor;
