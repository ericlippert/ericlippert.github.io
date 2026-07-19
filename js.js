"use strict";
window.onerror = alert;

let theCurrentLevel = null;
let theCurrentPlayer = null;
let theCurrentDisplay = null;

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
        const roomdata = createtherooms();//instead of just running the function that creates the room, sitll dothat, but save the data (grid and rooms)
        
        const dungeon = new Dungeon();
        theCurrentLevel = new Level(roomdata.grid);
        theCurrentLevel.parent = dungeon;

        theCurrentPlayer = new Player();
        theCurrentPlayer.name = storedData;
        theCurrentPlayer.parent = theCurrentLevel;
        
        const startroom = roomdata.rooms[uniformrandom(roomdata.rooms.length - 1)];//random start room now using new random ufnction
        theCurrentPlayer.x = Math.floor(startroom.left + startroom.width / 2);//player (invisible as of writing) in middle of room
        theCurrentPlayer.y = Math.floor(startroom.top + startroom.height / 2);
        
        const upStairway = new UpStairway();
        upStairway.x = theCurrentPlayer.x;
        upStairway.y = theCurrentPlayer.y;
        upStairway.parent = theCurrentLevel;

        const amuletRoom = roomdata.rooms[uniformrandom(roomdata.rooms.length - 1)];
        const amuletX = boundedrandom(amuletRoom.left + 1, amuletRoom.right - 2);
        const amuletY = boundedrandom(amuletRoom.top + 1, amuletRoom.bottom - 2);

        const amulet = new Amulet();
        amulet.x = amuletX;
        amulet.y = amuletY;
        amulet.parent = theCurrentLevel;

        // adding 3-7 hilichurls to random rooms
        const numHilichurls = boundedrandom(3, 7);
        for (let i = 0; i < numHilichurls; i++) {//loop through number of hilichurls to add
            for (let attempt = 0; attempt < 20; attempt++) {//20 attempts before giving up for each hilichurl
                const hilichurlRoom = roomdata.rooms[uniformrandom(roomdata.rooms.length - 1)];//getting a random room to place the hilichurl in
                const hx = boundedrandom(hilichurlRoom.left + 1, hilichurlRoom.right - 2);//random x in room
                const hy = boundedrandom(hilichurlRoom.top + 1, hilichurlRoom.bottom - 2);//random y in room

                const occupied = (theCurrentPlayer.x === hx && theCurrentPlayer.y === hy) ||
                theCurrentLevel.children.some(child => child.x === hx && child.y === hy);//arrow callback function checking if player is there or any other entities are there

                if (!occupied) {//if the position is not occupied
                    const theHilichurl = new hilichurl();//create the hilichurl
                    theHilichurl.x = hx;
                    theHilichurl.y = hy;
                    theHilichurl.parent = theCurrentLevel;
                    break;
                }
            }
        }

        console.log("Player spawned at:", theCurrentPlayer.x, theCurrentPlayer.y);
        console.log("Amulet spawned at:", amuletX, amuletY);
        console.log("made ", dungeon);//added earlier because the code wasn't working before
        
        theCurrentDisplay = new Grid(theCurrentLevel.map.width, theCurrentLevel.map.height, " ");//the grid that will be displayed. blank for now
        drawLevel(theCurrentLevel, theCurrentDisplay);//we have to pass in level instead of roomdata.grid becuase roomdata.grid doesn't know the location of the entities
        
        outputtext.classList.add("dungeon");//styling welcome text
        window.focus(); // Release focus from inputs so keyboard controls work instantly
    });
}



//new randomness functions that make the code more readable
function uniformrandom(max) {
    return Math.floor(Math.random() * (max + 1));
}


function boundedrandom(min, max) {
    return uniformrandom(max - min) + min;
}


function drawLevel(level, display) {
    for (let y = 0; y < level.map.height; y++) {
        for (let x = 0; x < level.map.width; x++) {
            display.set(x, y, level.map.get(x, y));//for all the tiles in the grid, add them to the display
        }
    }

    const sortedChildren = level.children.sort((a, b) => {//switched to new priority system which determines what should be displayed if multiple characters overlap
        const priorityA = a.renderPriority || 0;//0 if not defined for whatever reason. here we're telling the sorting algorithm what to sort all the entities by
        const priorityB = b.renderPriority || 0;
        return priorityA - priorityB;//return lowest first in entities list
    });

    for (const child of sortedChildren) {//loop through all the children and display them in order (highest priority is last as they get written last to display, meaning they'll nbe actually displayed)
        const symbol = child.symbol || "?";//gets symbol from child class (set to @ for player below) or '?' if there is no symbol
        display.set(child.x, child.y, symbol);//sets it onto the grid that is to be displayed
    }

    const gamegridtext = document.getElementById('gamegridtext');
    if (gamegridtext) {
        gamegridtext.textContent = display.toString();//draw to screen
    }
}

class Grid {
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

    addroom(room) {
        // corners
        this.set(room.left, room.top, "┌");
        this.set(room.right - 1, room.top, "┐");
        this.set(room.left, room.bottom - 1, "└");
        this.set(room.right - 1, room.bottom - 1, "┘");

        // top and bottom walls
        for (let x = room.left + 1; x < room.right - 1; x++) {
            this.set(x, room.top, "─");
            this.set(x, room.bottom - 1, "─");
        }

        // left and right walls
        for (let y = room.top + 1; y < room.bottom - 1; y++) {
            this.set(room.left, y, "│");
            this.set(room.right - 1, y, "│");
        }

        // interior empty space
        for (let y = room.top + 1; y < room.bottom - 1; y++) {
            for (let x = room.left + 1; x < room.right - 1; x++) {
                this.set(x, y, " ");
            }
        }
    }
}









class Entity {
    constructor() {
        if (new.target === Entity) {
            throw new Error("can't do that");//because you're supposed to make a specific kind of entity ("abstract class")
        }
        this._parent = null; //defaukt parents/childten (nothing)
        this._children = [];
    }

    get renderPriority() {
        return 0;//lowest priority by default so if anything has a (higher) priority set, it'll be displayed over this (such as player)
    }

    get isPortable() {
        return false;//can't take it by defualt
    }

    get parent() {
        return this._parent; //using a private variable so that there's no infinite loop 
    }

    set parent(newparent) {
        if (this._parent === newparent) return; //stop if the parent is already what it was trying t oeb set to

        const oldparent = this._parent;
        this._parent = newparent;

        if (oldparent) { //if there was an old parent, remove it
            oldparent.removechild(this);
        }

        if (newparent) { //if there's a new parent, add it
            newparent.addchild(this);
        }
    }

    get children() {
        return [...this._children];//... means to makea copy. we need that so that if someone tries to mess with the child list directly, it doesn't mess with our internal list.
    }

    addchild(child) {
        if (!this._children.includes(child)) {//only run if this isn't already the case
            this._children.push(child); //adds the child to the children list
            child.parent = this; // 'this' is the entity that is the paprent (th8is sets the child's parent)
        }
    }

    removechild(child) {
        const index = this._children.indexOf(child);
        if (index !== -1) {
            this._children.splice(index, 1);
            child.parent = null;
        }
    }
}

class Dungeon extends Entity { //extends means it's a modified version of the entity class. super(); means to just do the original thing from the normal entity class.
    constructor() {
        super();
    }
    get parent() {
        return super.parent;  //the amulet picking up/leaving doesn't work without this (including in the other entity classes)
    }
    set parent(newparent) {
        if (newparent !== null) {
            throw new Error("the parent of a dungeon entity must always be null.");
        }
        super.parent = newparent;
    }
}

class Level extends Entity {
    constructor(mapgrid) {
        super();
        this.map = mapgrid;
    }
    get parent() {
        return super.parent;
    }
    set parent(newparent) {
        if (newparent !== null && !(newparent instanceof Dungeon)) {
            throw new Error("the parent of a level must be a dungeon.");
        }
        super.parent = newparent;
    }
}

class Player extends Entity {
    constructor() {
        super();
        this.name = "";
        this.x = 0;
        this.y = 0;
    }
    get symbol() {
        return "@";
    }
    get renderPriority() {
        return 999999;//basically always displayed
    }
    get parent() {
        return super.parent;
    }
    set parent(newparent) {
        if (newparent !== null && !(newparent instanceof Level)) {
            throw new Error("the parent of a player must be a level.");
        }
        super.parent = newparent;
    }
}

class UpStairway extends Entity {
    get symbol() {
        return "<";//stair
    }
    get renderPriority() {
        return 10;//less than player
    }
    get parent() {
        return super.parent;
    }
    set parent(newparent) {
        if (newparent !== null && !(newparent instanceof Level)) {
            throw new Error("must be a level");
        }
        super.parent = newparent;
    }
}

class Amulet extends Entity {
    get symbol() {
        return '"';//i don't see how this is an amulet but ok
    }
    get renderPriority() {
        return 20;//less than player but more than stairs
    }
    get isPortable() {
        return true;//can pick it up
    }
    get parent() {
        return super.parent;
    }
    set parent(newparent) {
        if (newparent !== null && !(newparent instanceof Level) && !(newparent instanceof Player)) {
            throw new Error("must be a level or a player");
        }
        super.parent = newparent;
    }
}


class badGuy extends Entity {
    constructor() {
        super();
        if (new.target === badGuy) {
            throw new Error("you can't make a bad guy class on it's own since it's abstract");
        }
        this.x = 0;
        this.y = 0;
    }
    
    get parent() {
        return super.parent;
    }
    
    set parent(newparent) {
        if (newparent !== null && !(newparent instanceof Level)) {
            throw new Error("parent of a bad guy must be a level");
        }
        super.parent = newparent;
    }
}
class hilichurl extends badGuy {
    get symbol() {
        return "H"; // Representation on the grid
    }
    
    get renderPriority() {
        return 100; // Render below player (999999) but above stairs (10)
    }
}


class rectroom {
    constructor(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }

    get right() {
        return this.left + this.width;
    }

    get bottom() {
        return this.top + this.height; //rectangle.right and rectangle.bottom
    }

    // says true if the other rectangle is entirely inside this one.
    contains(other) {
        return other.left >= this.left &&
            other.right <= this.right &&
            other.top >= this.top &&
            other.bottom <= this.bottom;
    }

    // says true if the other rectangle overlaps with this one at all.
    overlaps(other) {
        return !(
            other.left >= this.right ||
            other.right <= this.left ||
            other.top >= this.bottom ||
            other.bottom <= this.top
        );
    }
}



//nested functions removed and some take in the gamegrid too now (some don't because they just check coordinnates and don't need access to the board itself)
function canconnectvertical(roomA, roomB) {
    const maxLeft = Math.max(roomA.left + 1, roomB.left + 1);
    const minRight = Math.min(roomA.right - 2, roomB.right - 2);
    return maxLeft <= minRight;
}

function canconnecthorizontal(roomA, roomB) {
    const maxTop = Math.max(roomA.top + 1, roomB.top + 1);
    const minBottom = Math.min(roomA.bottom - 2, roomB.bottom - 2);
    return maxTop <= minBottom;
}

function tunnelcollides(gamegrid, x1, y1, x2, y2) {
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

function digverticaltunnel(gamegrid, roomA, roomB) {
    const maxLeft = Math.max(roomA.left + 1, roomB.left + 1);
    const minRight = Math.min(roomA.right - 2, roomB.right - 2);
    if (maxLeft > minRight) return false;
    const tunnelX = Math.floor((maxLeft + minRight) / 2);

    const toproom = roomA.top < roomB.top ? roomA : roomB;
    const bottomroom = roomA.top < roomB.top ? roomB : roomA;

    const startY = toproom.bottom - 1;
    const endY = bottomroom.top;

    if (tunnelcollides(gamegrid, tunnelX, startY, tunnelX, endY)) { //quickly check if anytyhing in the way
        return false;
    }

    for (let y = startY; y <= endY; y++) {
        gamegrid.set(tunnelX, y, " "); //this makes the tunnel be blank space, INCLUDING the room border themselves (like a door)
    }
    return true;
}

function dighorizontaltunnel(gamegrid, roomA, roomB) {
    const maxTop = Math.max(roomA.top + 1, roomB.top + 1);
    const minBottom = Math.min(roomA.bottom - 2, roomB.bottom - 2);
    if (maxTop > minBottom) return false;
    const tunnelY = Math.floor((maxTop + minBottom) / 2); //so there can only be one tunnel between rooms (same thuing for vertical)

    // find out which room is to the left and which is to the right
    const leftRoom = roomA.left < roomB.left ? roomA : roomB;
    const rightRoom = roomA.left < roomB.left ? roomB : roomA;

    const startX = leftRoom.right - 1;
    const endX = rightRoom.left;

    if (tunnelcollides(gamegrid, startX, tunnelY, endX, tunnelY)) {
        return false;
    }

    for (let x = startX; x <= endX; x++) {
        gamegrid.set(x, tunnelY, " ");
    }
    return true;
}

function digbenttunnel(gamegrid, roomA, roomB) {
    const cxA = Math.floor(roomA.left + roomA.width / 2);
    const cyA = Math.floor(roomA.top + roomA.height / 2);
    const cxB = Math.floor(roomB.left + roomB.width / 2);
    const cyB = Math.floor(roomB.top + roomB.height / 2);

    let hStart1;
    if (cxB > cxA) //check whether to start on right wall or left wall of roomA
    {
        hStart1 = roomA.right - 1; // right wall
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
        vEnd1 = roomB.bottom - 1; // bottom wall
    }

    const hSeg1Collides = tunnelcollides(gamegrid, hStart1, cyA, hEnd1, cyA);  //checks if the horizontal part of the tunnel collides with anything
    const vSeg1Collides = tunnelcollides(gamegrid, cxB, vStart1, cxB, vEnd1);  //checks if the vertical part of the tunnel collides with anything
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
        vStart2 = roomA.bottom - 1; // bottom wall
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
        hEnd2 = roomB.right - 1; // right wall
    }

    const vSeg2Collides = tunnelcollides(gamegrid, cxA, vStart2, cxA, vEnd2);
    const hSeg2Collides = tunnelcollides(gamegrid, hStart2, cyB, hEnd2, cyB);
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





function trycreaterooms() {
    //code for creating random rooms
    let existingrooms = [];
    const howmanyroomstomake = boundedrandom(4, 10);
    const gridWidth = 50;
    const gridHeight = 50;
    let roomsleft = howmanyroomstomake;

    while (roomsleft > 0) {
        let width = boundedrandom(4, 8);
        let height = boundedrandom(4, 8);
        let left = uniformrandom(gridWidth - width); // so it doesn't extend out
        let top = uniformrandom(gridHeight - height); // so it doesn't extend out
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

    for (let room of existingrooms) {
        gamegrid.addroom(room);
    }
    gamegridtext.textContent = gamegrid.toString();

    let setofsets = [];
    for (let i = 0; i < existingrooms.length; i++) {
        setofsets.push(new Set([i]));
    }

    const tunnelattempts = existingrooms.length * 20; // increased so we have enough tries to connect everything
    for (let i = 0; i < tunnelattempts; i++) {

        let indexA = uniformrandom(existingrooms.length - 1);
        let indexB = uniformrandom(existingrooms.length - 1);

        while (indexB === indexA) {
            //force it to not be the same room
            indexB = uniformrandom(existingrooms.length - 1);
        }

        const roomA = existingrooms[indexA];
        const roomB = existingrooms[indexB];

        let success = false;
        // check vertical first, then horizontal, then bent
        if (canconnectvertical(roomA, roomB)) {
            success = digverticaltunnel(gamegrid, roomA, roomB);
        }

        else if (canconnecthorizontal(roomA, roomB)) {
            success = dighorizontaltunnel(gamegrid, roomA, roomB);
        }

        else {
            success = digbenttunnel(gamegrid, roomA, roomB);
        }

        if (success) {
            let setA = setofsets.find(s => s.has(indexA)); // tgets the current set within the set that has the number that room A is in
            let setB = setofsets.find(s => s.has(indexB)); // same but b
            if (setA && setB && setA !== setB) { // if success and they are currently not in the same set......
                setB.forEach(val => setA.add(val)); //add (not move but add) the rooms from B to A
                setofsets = setofsets.filter(s => s !== setB); //remove B from setofsets so it's not counted twice and will now get merged into A on the next loop
                }
            }

        // if there's only 1 set left then all rooms are connected
        if (setofsets.length === 1) {
            break;
        }
    }

    if (setofsets.length === 1) {
        gamegridtext.textContent = gamegrid.toString();
        return { rooms: existingrooms, grid: gamegrid }; // returning the data of the rooms and grid so it can be used in the rest of the game other than this function that just makes the initial grid
    }
}

function createtherooms() {
    for (let attempt = 0; attempt < 100; attempt++) {
        let success = trycreaterooms();
        if (success) return success;//continues to return the data given by `return { rooms: existingrooms, grid: gamegrid }; `
    } // end of the 100 tries loop
    throw new Error("didn't work");
} // end createtherooms

class Action {
    constructor(doer) {
        this.doer = doer;
    }
    execute() {//no more doAction function at all; there's an execute in each action class that has the thing to move passed into it
        throw new Error("you actually have to execute a single action.");
    }
}

class moveAction extends Action {
    constructor(doer, dx, dy) {//d for delta
        super(doer);
        this.dx = dx; // -1, 0, or 1 for movement on both axis
        this.dy = dy;
    }
    execute() {
        const level = this.doer.parent;
        if (!(level instanceof Level)) return;//failsafe

        const newX = this.doer.x + this.dx;
        const newY = this.doer.y + this.dy;

        if (isWalkable(level, newX, newY)) {
            this.doer.x = newX;
            this.doer.y = newY;
            drawLevel(level, theCurrentDisplay);//draw the grid with updated position
        }
    }
}

class pickupAction extends Action {
    constructor(doer) {
        super(doer);
    }
    execute() {
        const level = this.doer.parent;
        if (level instanceof Level) //make sure valid level object
        {
            const itemsToPickUp = level.children.filter(child =>//list of items that can be picked up
                child !== this.doer &&//can;t be player
                child.x === this.doer.x &&//must be same x and y
                child.y === this.doer.y &&//
                child.isPortable//has to be able to be picked up
            );


            for (const item of itemsToPickUp) 
            {
                item.parent = this.doer;//become under the player instead of the level
            }

            if (itemsToPickUp.length > 0) //if anything was picked up
            {
                drawLevel(level, theCurrentDisplay);
                const itemNames = itemsToPickUp.map(item => item.constructor.name).join(", ");
                const output = document.getElementById('outputtext');
                if (output) 
                {
                    output.textContent = `You picked up: ${itemNames}`;
                }
            }
        }
    }
}

class climbStairsAction extends Action {
    constructor(doer) {
        super(doer);
    }
    execute() {
        const level = this.doer.parent;
        if (level instanceof Level) //make sure valid level object
        {
            const stairway = level.children.find(child =>//look for stairway at the same position
                child instanceof UpStairway &&
                child.x === this.doer.x &&
                child.y === this.doer.y
            );


            if (stairway) //if there's a stairway at the same position
            {
                const hasAmulet = this.doer.children.some(child => child instanceof Amulet);//check if the amulet is a child of the player
                const output = document.getElementById('outputtext');

                if (hasAmulet) 
                {
                    if (output) 
                    {
                        output.textContent = "You escaped with the Amulet! You Win!";
                    }
                } 
                else 
                {
                    if (output) 
                    {
                        output.textContent = "You escaped without the Amulet! You Lose!";
                    }
                }

                if (this.doer === theCurrentPlayer) {
                    theCurrentPlayer = null;
                    theCurrentLevel = null;
                }
            }
        }
    }
}

function isWalkable(level, x, y) {
    if (x < 0 || x >= level.map.width || y < 0 || y >= level.map.height) {
        return false;
    }
    if (level.map.get(x, y) !== " ") {
        return false;
    }
    const occupied = level.children.some(child => //can't move there if there's some entity in the way
        (child instanceof Player || child instanceof badGuy) &&
        child.x === x &&
        child.y === y
    );
    return !occupied;//if occupied is false, isWalkable is true (& vice versa)
}

window.addEventListener("keydown", (event) => {
    if (!theCurrentPlayer || !theCurrentLevel) return;//so the user can still use wasd for their name before the gane loads
    let action = null; //instead of "let action;" to line if (action !== null) doesn't always run

    if (event.key === "w" || event.key === "W") {//wasd for movement instead of arrow keys for universal controls with other games + natural hand placement + some keyboard don't have arrow keys
        action = new moveAction(theCurrentPlayer, 0, -1);//now defining which specific thing gets moved instead of hardcoded to player
    } else if (event.key === "s" || event.key === "S") {
        action = new moveAction(theCurrentPlayer, 0, 1);
    } else if (event.key === "a" || event.key === "A") {
        action = new moveAction(theCurrentPlayer, -1, 0);
    } else if (event.key === "d" || event.key === "D") {
        action = new moveAction(theCurrentPlayer, 1, 0);
    } else if (event.key === ",") {
        action = new pickupAction(theCurrentPlayer);
    } else if (event.key === "<") {
        action = new climbStairsAction(theCurrentPlayer);
    }

    if (action !== null) {
        event.preventDefault();
        action.execute();//send in the movement code

        // monsters' turn.
        if (theCurrentLevel && theCurrentPlayer) {//failsafe
            const badGuys = theCurrentLevel.children.filter(child => child instanceof badGuy);//get list array of all hilichurls
            for (const monster of badGuys) {//for each hilichurl
                // Generate a random step (-1, 0, or 1 in both dimensions)
                const dx = uniformrandom(2) - 1;
                const dy = uniformrandom(2) - 1;
                if (dx !== 0 || dy !== 0) {//if the monster didn't stay in the same spot
                    const monsterMove = new moveAction(monster, dx, dy);//now we can create a move action for not the player as well
                    monsterMove.execute();
                }
            }
        }
    }
});



