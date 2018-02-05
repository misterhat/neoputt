class Editor {
    constructor(name, map) {
        this.map = map;
        this.map.name = name;

        this.entities = [ 'url(ball.png)', 'url(line.png)' ];
        this.fill = false;
        this.grid = true;
        this.redoHistory = [];
        this.selectedTile = 2;
        this.undoHistory = [];
    }

    clear() {
        this.map.initTiles();
    }

    paint(x, y) {
        this.map.tiles[x][y] = this.selectedTile;
    }
}

module.exports = Editor;
