"use strict";
window.onerror = alert;

const submitbutton = document.getElementById('submitbutton');
if (submitbutton) {
    const inputbox = document.getElementById('inputbox');
    const outputtext = document.getElementById('outputtext');
    const enteryourname = document.getElementById('enteryourname');
    const gamegridtext = document.getElementById('gamegridtext');

    // let instead of var but let me know if var is better for this -jj
    let storedData = "";

    submitbutton.addEventListener('click', () => {
        storedData = inputbox.value;
        inputbox.style.display = 'none';
        enteryourname.style.display = 'none';
        submitbutton.style.display = 'none';
        console.log(storedData);
        outputtext.textContent = "hello " + storedData + ", welcome to the dungeon.";
        const roomData = createtherooms();
        
        const dungeon = new Dungeon();
        const level = new Level(roomData.grid);
        level.parent = dungeon;

        const player = new Player();
        player.name = storedData;
        player.parent = level;
        
        const startRoom = roomData.rooms[Math.floor(Math.random() * roomData.rooms.length)];
        player.x = Math.floor(startRoom.left + startRoom.width / 2);
        player.y = Math.floor(startRoom.top + startRoom.height / 2);
        
        console.log("Dungeon system constructed:", dungeon);
        
        outputtext.classList.add("dungeon");
    });
}








// i moved it here. the above code won't run in test.html because there is no submitbutton. i'd ask that all the actual code for the site goes HERE in this one js file and not scattered between many JS files. just personal preference
class Grid {
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
            lines.push(this.grid[y].join(""));
        }
        return lines.join("\n");
    }
}









class Entity {
    constructor() {
        if (new.target === Entity) {
            throw new Error("Cannot instantiate abstract class Entity.");
        }
        this._parent = null;
        this._children = [];
    }

    get parent() {
        return this._parent;
    }

    set parent(newParent) {
        if (this._parent === newParent) return;

        const oldParent = this._parent;
        this._parent = newParent;

        if (oldParent) {
            oldParent.removeChild(this);
        }

        if (newParent) {
            newParent.addChild(this);
        }
    }

    get children() {
        return [...this._children];
    }

    addChild(child) {
        if (!this._children.includes(child)) {
            this._children.push(child);
            child.parent = this;
        }
    }

    removeChild(child) {
        const index = this._children.indexOf(child);
        if (index !== -1) {
            this._children.splice(index, 1);
            child.parent = null;
        }
    }
}

class Dungeon extends Entity {
    constructor() {
        super();
    }
    set parent(newParent) {
        if (newParent !== null) {
            throw new Error("The parent of a Dungeon entity must always be null.");
        }
        super.parent = newParent;
    }
}

class Level extends Entity {
    constructor(mapGrid) {
        super();
        this.map = mapGrid;
    }
    set parent(newParent) {
        if (newParent !== null && !(newParent instanceof Dungeon)) {
            throw new Error("The parent of a Level must be a Dungeon.");
        }
        super.parent = newParent;
    }
}

class Player extends Entity {
    constructor() {
        super();
        this.name = "";
        this.x = 0;
        this.y = 0;
    }
    set parent(newParent) {
        if (newParent !== null && !(newParent instanceof Level)) {
            throw new Error("The parent of a Player must be a Level.");
        }
        super.parent = newParent;
    }
}

class rectroom {
    constructor(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }

    // says true if the other rectangle is entirely inside this one.
    contains(other) {
        return other.left >= this.left &&
            (other.left + other.width) <= (this.left + this.width) &&  //right side
            other.top >= this.top &&
            (other.top + other.height) <= (this.top + this.height);    //bottom side
    }

    // says  true if the other rectangle overlaps with this one at all.
    overlaps(other) {
        return !(
            other.left >= this.left + this.width ||
            other.left + other.width <= this.left || //right side
            other.top >= this.top + this.height ||
            other.top + other.height <= this.top //bottom side
        );
    }
}




function createtherooms() {



    for (let attempt = 0; attempt < 100; attempt++) {

    //code for creating random rooms
    let existingrooms = [];
    const howmanyroomstomake = Math.floor(Math.random() * 7) + 4;
    const gridWidth = 50;
    const gridHeight = 50;
    let roomsleft = howmanyroomstomake;

    while (roomsleft > 0) {
        let width = Math.floor(Math.random() * 5) + 4; // random 4 to 8
        let height = Math.floor(Math.random() * 5) + 4; // random 4 to 8
        let left = Math.floor(Math.random() * (gridWidth - width + 1)); // random 0 to 50 minus the width (so it doesn't extend out)
        let top = Math.floor(Math.random() * (gridHeight - height + 1)); // random 0 to 50 minus the height (so it doesn't extend out)
        let newroom = new rectroom(left, top, width, height);

        let overlaps = false;
        let iscontained = false;
        for (let i = 0; i < existingrooms.length; i++) {
            if (newroom.overlaps(existingrooms[i])) {
                overlaps = true;
            }
            if (existingrooms[i].contains(newroom)) {
                iscontained = true;
            }
            if (overlaps || iscontained) {
                break;
            }
        }

        if (!overlaps && !iscontained) {
            existingrooms.push(newroom);
            roomsleft -= 1;

        }
    }
    console.log(existingrooms);





    //create a grid and fill it with something that i keep changing and then set it to a pre element 
    const gamegrid = new Grid(50, 50, "█");
    gamegridtext.textContent = gamegrid.toString();



    //put the rooms into the grid
    for (let i = 0; i < existingrooms.length; i++) {
        const room = existingrooms[i];

        for (let y = room.top; y < room.top + room.height; y++) { //travel down the grid foreach row
            for (let x = room.left; x < room.left + room.width; x++) { // each pixel on the row on the grid (column)
                // this is the kinda spaghetti code to draw room borders and the hollow inside
                if (x === room.left) {
                    if (y === room.top) {
                        gamegrid.set(x, y, "┌");
                    }
                    else if (y === room.top + room.height - 1) {
                        gamegrid.set(x, y, "└");
                    }
                    else {
                        gamegrid.set(x, y, "│");
                    }
                }

                else if (x === room.left + room.width - 1) {
                    if (y === room.top) {
                        gamegrid.set(x, y, "┐");
                    }
                    else if (y === room.top + room.height - 1) {
                        gamegrid.set(x, y, "┘");
                    }
                    else {
                        gamegrid.set(x, y, "│");
                    }
                }

                else if (y === room.top) {
                    gamegrid.set(x, y, "─");
                }

                else if (y === room.top + room.height - 1) {
                    gamegrid.set(x, y, "─");
                }

                else {
                    gamegrid.set(x, y, " ");
                }
            }
        }
    }
    gamegridtext.textContent = gamegrid.toString();


    // straight tunnel code

    function canconnectvertical(roomA, roomB) {
        const sharedLeft = Math.max(roomA.left, roomB.left);
        const sharedRight = Math.min(roomA.left + roomA.width, roomB.left + roomB.width);
        return sharedLeft < sharedRight;
    }

    function canconnecthorizontal(roomA, roomB) {
        const sharedTop = Math.max(roomA.top, roomB.top);
        const sharedBottom = Math.min(roomA.top + roomA.height, roomB.top + roomB.height);
        return sharedTop < sharedBottom;
    }

    function tunnelcollides(x1, y1, x2, y2) {
        if (x1 === x2) {
            // vertical tunnel x is fixed, y changes
            const startY = Math.min(y1, y2) + 1;
            const endY = Math.max(y1, y2) - 1;
            for (let y = startY; y <= endY; y++) {
                if (gamegrid.get(x1, y) !== "█") {
                    return true;
                }
            }
        }

        else {
            const startX = Math.min(x1, x2) + 1; //the +1 here and the -1 below make it only scan tiles between the rooms, not the room borders themselves
            const endX = Math.max(x1, x2) - 1;
            for (let x = startX; x <= endX; x++) {
                if (gamegrid.get(x, y1) !== "█") {
                    return true; // hit not empty space
                }
            }
        }
        return false;
    }

    function digverticaltunnel(roomA, roomB) {
        const sharedleft = Math.max(roomA.left, roomB.left);
        const sharedright = Math.min(roomA.left + roomA.width, roomB.left + roomB.width);
        const tunnelX = Math.floor((sharedleft + sharedright) / 2);

        const toproom = roomA.top < roomB.top ? roomA : roomB;
        const bottomroom = roomA.top < roomB.top ? roomB : roomA;

        const startY = toproom.top + toproom.height - 1;
        const endY = bottomroom.top;

        if (tunnelcollides(tunnelX, startY, tunnelX, endY)) { //quickly check if anytyhing in the way
            return false;
        }

        for (let y = startY; y <= endY; y++) {
            gamegrid.set(tunnelX, y, " "); //this makes the tunnel be blank space, INCLIDING the room border themselves (like a door)
        }
        return true;
    }

    function dighorizontaltunnel(roomA, roomB) {
        const sharedTop = Math.max(roomA.top, roomB.top);
        const sharedBottom = Math.min(roomA.top + roomA.height, roomB.top + roomB.height);
        const tunnelY = Math.floor((sharedTop + sharedBottom) / 2); //so there can only be one tunnel between rooms (same thuing for vertical)

        // find out which room is to the left and which is to the right
        const leftRoom = roomA.left < roomB.left ? roomA : roomB;
        const rightRoom = roomA.left < roomB.left ? roomB : roomA;

        const startX = leftRoom.left + leftRoom.width - 1;
        const endX = rightRoom.left;

        if (tunnelcollides(startX, tunnelY, endX, tunnelY)) {
            return false;
        }

        for (let x = startX; x <= endX; x++) {
            gamegrid.set(x, tunnelY, " ");
        }
        return true;
    }

    function digbenttunnel(roomA, roomB) {
        const cxA = Math.floor(roomA.left + roomA.width / 2);
        const cyA = Math.floor(roomA.top + roomA.height / 2);
        const cxB = Math.floor(roomB.left + roomB.width / 2);
        const cyB = Math.floor(roomB.top + roomB.height / 2);

        let hStart1;
        if (cxB > cxA) //check whether to start on right wall or left wall of roomA
        {
            hStart1 = roomA.left + roomA.width - 1; // right wall
        }
        else {
            hStart1 = roomA.left; // left wall
        }

        const hEnd1 = cxB;

        const vStart1 = cyA;
        let vEnd1;
        if (cyB > cyA) // check whether to end on top wall or bottom wall of roomB
        {
            vEnd1 = roomB.top; // top wall
        }
        else {
            vEnd1 = roomB.top + roomB.height - 1; // bottom wall
        }

        const hSeg1Collides = tunnelcollides(hStart1, cyA, hEnd1, cyA);  //checks if the horizontal part of the tunnel collides with anything
        const vSeg1Collides = tunnelcollides(cxB, vStart1, cxB, vEnd1);  //checks if the vertical part of the tunnel collides with anything
        const corner1Solid = gamegrid.get(cxB, cyA) === "█"; //checks if the corner is empty

        if (!hSeg1Collides && !vSeg1Collides && corner1Solid) // if those above three things are true then dig the tunnel
        {

            const startX = Math.min(cxA, cxB); // start at the leftmost x coordinate of either room a or b
            const endX = Math.max(cxA, cxB); // end at the rightmost x coordinate of either room a or b

            for (let x = startX; x <= endX; x++) // loop through the x coordinates
            {
                gamegrid.set(x, cyA, " ");
            }

            const startY = Math.min(cyA, cyB); //same thing but up
            const endY = Math.max(cyA, cyB);

            for (let y = startY; y <= endY; y++) {
                gamegrid.set(cxB, y, " ");
            }

            return true; //stop if this worked
        }
        // all of this is the exact same stuff but vertical first
        let vStart2;
        if (cyB > cyA) // check whether to start on bottom wall or top wall of roomA
        {
            vStart2 = roomA.top + roomA.height - 1; // bottom wall
        }
        else {
            vStart2 = roomA.top; // top wall
        }
        const vEnd2 = cyB;
        const hStart2 = cxA;
        let hEnd2;
        if (cxB > cxA) // check whether to end on left wall or right wall of roomB
        {
            hEnd2 = roomB.left; // left wall
        }
        else {
            hEnd2 = roomB.left + roomB.width - 1; // right wall
        }

        const vSeg2Collides = tunnelcollides(cxA, vStart2, cxA, vEnd2);
        const hSeg2Collides = tunnelcollides(hStart2, cyB, hEnd2, cyB);
        const corner2Solid = gamegrid.get(cxA, cyB) === "█";

        if (!vSeg2Collides && !hSeg2Collides && corner2Solid) {
            const startY = Math.min(cyA, cyB);
            const endY = Math.max(cyA, cyB);

            for (let y = startY; y <= endY; y++) {
                gamegrid.set(cxA, y, " ");
            }

            const startX = Math.min(cxA, cxB);
            const endX = Math.max(cxA, cxB);

            for (let x = startX; x <= endX; x++) {
                gamegrid.set(x, cyB, " ");
            }

            return true;//stop if this worked
        }

        return false;// if those above all failed, then it failed and leaves
    }


    let setofsets = [];
    for (let i = 0; i < existingrooms.length; i++) {
        setofsets.push(new Set([i]));
    }

    const tunnelattempts = existingrooms.length * 20; // increased so we have enough tries to connect everything
    for (let i = 0; i < tunnelattempts; i++) {

        let indexA = Math.floor(Math.random() * existingrooms.length);
        let indexB = Math.floor(Math.random() * existingrooms.length);

        while (indexB === indexA) {
            //force it to not be the same room
            indexB = Math.floor(Math.random() * existingrooms.length);
        }

        const roomA = existingrooms[indexA];
        const roomB = existingrooms[indexB];

        let success = false;
        // check vertical first, then horizontal, then bent
        if (canconnectvertical(roomA, roomB)) {
            success = digverticaltunnel(roomA, roomB);
        }

        else if (canconnecthorizontal(roomA, roomB)) {
            success = dighorizontaltunnel(roomA, roomB);
        }

        else {
            success = digbenttunnel(roomA, roomB);
        }

        if (success) {
            let setA = setofsets.find(s => s.has(indexA)); // tgets the current set within the set that has the number that room A is in
            let setB = setofsets.find(s => s.has(indexB)); // same but b
            if (setA && setB && setA !== setB) { // if success and they are currently not in the same set......
                setB.forEach(val => setA.add(val)); //add (not move but add) the rooms from B to A
                setofsets = setofsets.filter(s => s !== setB); //remove B from setofsets so it's not counted twice and will now get merged into A on the next loop
            }
        }
        //^^^^^^^^^ high-tech

        // if there's only 1 set left then all rooms are connected
        if (setofsets.length === 1) {
            break;
        }

    }

    if (setofsets.length === 1) {
        gamegridtext.textContent = gamegrid.toString();
        return { rooms: existingrooms, grid: gamegrid }; // success
    }
    } // end of the 100 tries loop
    throw new Error("Failed to generate a connected dungeon after 100 attempts.");


// v  just so i dont get confused this ends the createtherooms function
   } // <------
// ^



