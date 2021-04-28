class Cell {
    
    constructor(id, x, y) {

        // ID/index
        this.id = id;

        // Group ID for merging
        this.gid = id;

        this.x = x;
        this.y = y;
    }

}

class Edge {


    constructor(cellOne, cellTwo, orient, x, y) {
        // Cells referenced by this edge
        this.cellOne = cellOne;
        this.cellTwo = cellTwo;

        // Orientation of this edge i.e. wall
        // true = x, false = y
        this.x_orientation = orient;

        // Removed boolean, initally set to false
        this.removed = false;

        this.x = x;
        this.y = y;
    }
}
class Maze {

    // Gives 1D index from 2D coords
    index(x, y) {
        return x + y * (this.n);
    }

    // Runs Kruskals algorithm to set edges to removed
    runKruskals() {
        // The inital number of groups (continous rooms) in the maze
        var nGroups = this.cells.length;

        // While there's still more than one group
        while(nGroups > 1) {
            // Chooose random edge
            let randIndex = Math.floor(Math.random() * (this.edges.length - 1));
            // Only if the edge actually separates two rooms
            if (this.edges[randIndex].cellOne.gid !== this.edges[randIndex].cellTwo.gid) {
                // Remove edge
                this.edges[randIndex].removed = true;

                // Merge GIDs 
                this.mergeGroups(this.edges[randIndex].cellOne.gid, this.edges[randIndex].cellTwo.gid);

                // Let the counter reflect that one less room now exists
                nGroups--;
            }
        }
    }

    // Merges the 'from' group into the 'to' group among cells
    mergeGroups(to, from) {
        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i].gid == from) {
                this.cells[i].gid = to;
            }
        }
    }

    // Gets all non-removed edges
    // These edges have appropriate position based on cell coordinates which can be scaled
    getEdges() {
        let goodEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            if (this.edges[i].removed == false) {
                goodEdges.push(this.edges[i]);
            }
        }

        return goodEdges;
    }

    // Creates the basic structure of the maze
    constructor(n) {
        this.n = n;
        this.cells = [];
        this.edges = [];
        for (let x = 0; x < n; x++) {
            for (let y = 0; y < n; y++) {
                // create cell with group id = id
                this.cells[this.index(x, y)] = (new Cell(this.index(x, y), x, y));
            }
        }

        var idIter = 0;
        for (let x = 0; x < n; x++) {
            for (let y = 0; y < n; y++) {
                // Create edge in x direction if not at edge
                if (x < n - 1) {
                    this.edges[idIter] = new Edge(this.cells[this.index(x, y)], this.cells[this.index(x + 1, y)], true, x + 0.5, y)
                    idIter++;
                }

                if (y < n - 1) {
                    this.edges[idIter] = new Edge(this.cells[this.index(x, y)], this.cells[this.index(x, y + 1)], false, x, y + 0.5)
                    idIter++;
                }
            }
        }

    }
}

export default Maze;
