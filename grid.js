"use strict";

class Grid
{
    // TODO: Fill this in so that the tests pass.

    // A grid is a rectangular array where the top left corner is (0, 0) and the bottom right
    // corner is (width-1, height-1). For example, a width 4 height 2 grid with contents:
    //
    // ABCD
    // EFGH
    //
    // A is at (0, 0), H is at (3, 1)
    //
    // TODO: write a test that verifies the information in this example.

    constructor(width, height, val) {
        // if there's negative values in width or height
        if (width < 0 || height < 0) {
            throw new RangeError("Width and height must be greater than or equal to zero.");
        }
        this.width = width;
        this.height = height;
        this.grid = [];
        // make a row for each column
        for (let y = 0; y < height; y++) {
            let row = [];
            for (let x = 0; x < width; x++) {
                row.push(val);
            }
            this.grid.push(row);
        }
    }
    // get an x and y coordinae's value
    get(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            throw new RangeError("x or y out of bounds");
        }
        return this.grid[y][x];
    }
    // sets an x and y coordinate's value
    set(x, y, newval) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            throw new RangeError("x or y out of bounds");
        }
        this.grid[y][x] = newval;
    }
    // turns the grid into a string with a newline \n between each row
    toString() {
        let lines = [];
        for (let y = 0; y < this.height; y++) {
            // Join items in the row together with no spaces
            lines.push(this.grid[y].join(""));
        }
        // Join the rows together using a new line character \n
        return lines.join("\n");
    }
}
