"use strict";
window.onerror = alert;

let theCurrentLevel = null;
let theCurrentPlayer = null;
let theCurrentDisplay = null;
let isDropping = false;

const messageLog = [];//the output box should log messages (20 i've decided) instead of just showing one
function logMessage(message) {
    messageLog.push(message);//adds the message to the end of the array
    if (messageLog.length > 20) {
        messageLog.shift(); // deletes the 21st oldest message, keeping 20
    }
    const output = document.getElementById('outputtext');
    if (output)//failsafe
    {
        output.innerText = messageLog.join("\n");//new line character beetween each line
        output.scrollTop = output.scrollHeight; // Auto-scroll to the bottom
    }
}

const submitbutton = document.getElementById('submitbutton');
if (submitbutton) {
    const inputbox = document.getElementById('inputbox');
    const outputtext = document.getElementById('outputtext');
    const enteryourname = document.getElementById('enteryourname');
    const gamegridtext = document.getElementById('gamegridtext');

    let storedData = "";

    submitbutton.addEventListener('click', () => {
        storedData = inputbox.value;
        inputbox.style.display = 'none';
        enteryourname.style.display = 'none';
        submitbutton.style.display = 'none';
        
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.display = 'flex';//so it doesn't awkwardly display before the game starts
        }
        console.log(storedData);
        logMessage("hello " + storedData + ", welcome to the dungeon.");//using new log function instead
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

        const crownRoom = roomdata.rooms[uniformrandom(roomdata.rooms.length - 1)];
        const crownX = boundedrandom(crownRoom.left + 1, crownRoom.right - 2);
        const crownY = boundedrandom(crownRoom.top + 1, crownRoom.bottom - 2);

        const crown = new Crown();
        crown.x = crownX;
        crown.y = crownY;
        crown.parent = theCurrentLevel;

        //spawning random items on the level
        const itemClasses = [Coffee, Sword, Lyre, Potion, Sword];//list of all the items
        const numItems = boundedrandom(5, 10);
        for (let i = 0; i < numItems; i++) {//for the randomly chosen amount of items
            for (let attempt = 0; attempt < 20; attempt++) {//20 attempts
                const itemRoom = roomdata.rooms[uniformrandom(roomdata.rooms.length - 1)];//random room
                const ix = boundedrandom(itemRoom.left + 1, itemRoom.right - 2);//random x in room
                const iy = boundedrandom(itemRoom.top + 1, itemRoom.bottom - 2);//random y in room

                const occupied = (theCurrentPlayer.x === ix && theCurrentPlayer.y === iy) || theCurrentLevel.children.some(child => child.x === ix && child.y === iy);//check if there's an entity there already

                if (!occupied) {//if not occupied 
                    const itemClass = itemClasses[uniformrandom(itemClasses.length - 1)];//random item with the name itemClass
                    const item = new itemClass();//create the item
                    item.x = ix;//set location
                    item.y = iy;
                    item.parent = theCurrentLevel;
                    break;
                }
            }
        }

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

                    // 30% chance for this hilichurl to get a random item
                    if (uniformrandom(9) < 3) {
                        const itemClass = itemClasses[uniformrandom(itemClasses.length - 1)];
                        const carriedItem = new itemClass();
                        carriedItem.parent = theHilichurl;
                    }
                    break;
                }
            }
        }

        console.log("Player spawned at:", theCurrentPlayer.x, theCurrentPlayer.y);
        console.log("Crown spawned at:", crownX, crownY);
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
        return super.parent;  //the crown picking up/leaving doesn't work without this (including in the other entity classes)
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

class Item extends Entity{
    get isPortable() {
        return true;
    }
    
    get parent() {
        return super.parent;
    }
    
    set parent(newparent) {
        if (newparent !== null && !(newparent instanceof Level) && !(newparent instanceof Player) && !(newparent instanceof badGuy))//evaluates to false overall if the parent isn't a level, badguy, or player
        {
            throw new Error("Parent of an item must be a level, a player, or a monster.");
        }
        super.parent = newparent;
    }
}

class Crown extends Item {
    get symbol() {
        return '♕';//crown now and i'm using the chess piece
    }
    get renderPriority() {
        return 20;//less than player but more than stairs
    }
}

class Sword extends Item {
    get symbol() {
        return '⚔';//it might render as an emoji in IDE but in firefox it's a regular unicode character which doesn't push the row to the right (since emojis are too wide)
    }
    get renderPriority() {
        return 20;//less than player but more than stairs
    }
}

class Coffee extends Item {
    get symbol() {
        return '☕︎';
    }
    get renderPriority() {
        return 20;
    }
}

class Potion extends Item {
    get symbol() {
        return '⚗';
    }
    get renderPriority() {
        return 20;
    }
}

class Cloak extends Item {
    get symbol() {
        return '𓀠';
    }
    get renderPriority() {
        return 20;
    }
}

class Lyre extends Item {
    get symbol() {
        return '♪';
    }
    get renderPriority() {
        return 20;
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

    canPickUp(item) {
        return true;
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
    const minRight = Math.min(roomA.right - 1, roomB.right - 1);
    return maxLeft < minRight;
}

function canconnecthorizontal(roomA, roomB) {
    const maxTop = Math.max(roomA.top + 1, roomB.top + 1);
    const minBottom = Math.min(roomA.bottom - 1, roomB.bottom - 1);
    return maxTop < minBottom;
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
    const minRight = Math.min(roomA.right - 1, roomB.right - 1);
    if (maxLeft >= minRight) return false;
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
    const minBottom = Math.min(roomA.bottom - 1, roomB.bottom - 1);
    if (maxTop >= minBottom) return false;
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
                logMessage("you picked up: " + itemNames);
                if (this.doer === theCurrentPlayer) {
                    new listInventoryAction(this.doer).execute();//automatically list the inventory when picking up an item
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
                const hasCrown = this.doer.children.some(child => child instanceof Crown);//check if the crown is a child of the player
                if (hasCrown) 
                {
                    logMessage("you escaped with the Crown! You Win!");
                } 
                else 
                {
                    logMessage("you escaped without the Crown! You Lose!");
                }

                if (this.doer === theCurrentPlayer) {
                    theCurrentPlayer = null;
                    theCurrentLevel = null;
                }
            }
        }
    }
}

class listInventoryAction extends Action {
    execute() {
        const div = document.getElementById("inventory-list");//the new html div for the list
        if (!div) return;//failsafe
        const children = this.doer.children;//gets the items that are children of the player (this.doer)
        if (children.length === 0) //if no items
        {
            div.innerText = "You are empty-handed.";
        } 
        else //if has items
        {
            div.innerText = children.map((item, idx) => //.map loops through all the elements in the array "children" which is going to be passed in as the array of the children of the player
                (idx + 1) + ". " + item.constructor.name.toLowerCase()// "(idx + 1) + ". " + " lists them as like "1. 2. 3."
            ).join("\n");//makes a new line for each item
        }
    }
}

class dropAction extends Action {
    constructor(doer, item)//getting the entity dropping the item and which item to have dropped respectively
    {
        super(doer);
        this.item = item;
    }
    execute() {
        const level = this.doer.parent;
        if (level instanceof Level)//failsafe
        {
            this.item.x = this.doer.x;//
            this.item.y = this.doer.y;//item is dropped where the dropper is standing
            this.item.parent = level;//item now has the parent of level instead of the entity that dropped it
            drawLevel(level, theCurrentDisplay);//redraw screen since it now needs to be on the floor
            
            logMessage("you dropped: " + this.item.constructor.name.toLowerCase());
            if (this.doer === theCurrentPlayer) {
                new listInventoryAction(this.doer).execute();//show inventory when dropping an item
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

function monstersTurn() {
    if (theCurrentLevel && theCurrentPlayer) {//failsafe
        const badGuys = theCurrentLevel.children.filter(child => child instanceof badGuy);//get list array of all monsters
        for (const monster of badGuys) {//for each monster
            let actionTaken = false;

            //try to drop a carried item
            const inventory = monster.children;
            if (inventory.length > 0 && uniformrandom(9) === 0) { // 10% chance
                const itemToDrop = inventory[uniformrandom(inventory.length - 1)];//get an item from monster inventory
                itemToDrop.x = monster.x;//
                itemToDrop.y = monster.y;//drop the item onto the level where the monster was
                itemToDrop.parent = theCurrentLevel;//now on the level instead of the monster
                actionTaken = true;
                
                logMessage(monster.constructor.name + " dropped a " + itemToDrop.constructor.name.toLowerCase() + "!");
            }

            //try to pick up an item on the ground
            if (!actionTaken)//if the monster didn't drop anything
            {
                const itemsOnGround = theCurrentLevel.children.filter(child =>//find items the monster can pick up using .filter in a callback function
                    child.isPortable &&//checks if the item is portable
                    child.x === monster.x &&//checks if the item is at the same position as monster
                    child.y === monster.y &&//
                    monster.canPickUp(child)//checks if the monster can pick up the item
                );
                if (itemsOnGround.length > 0 && uniformrandom(1) === 0) { // 50% chance and if there actually is anything there
                    const itemToPick = itemsOnGround[uniformrandom(itemsOnGround.length - 1)];//get an item to pick up if there's multiple
                    itemToPick.parent = monster;//set the item's parent to the monster so it's carried
                    actionTaken = true;//the monster took an action

                    logMessage(monster.constructor.name + " picked up a " + itemToPick.constructor.name.toLowerCase() + "!");
                }
            }

            //if no picling up or putting downn, move randomly
            if (!actionTaken) {
                // Generate a random step (-1, 0, or 1 in both dimensions)
                const dx = uniformrandom(2) - 1;
                const dy = uniformrandom(2) - 1;
                if (dx !== 0 || dy !== 0) {//if the monster didn't stay in the same spot
                    const monsterMove = new moveAction(monster, dx, dy);//make a move action
                    monsterMove.execute();//do the move action
                }
            }
        }
        // Redraw the map display after monsters action
        drawLevel(theCurrentLevel, theCurrentDisplay);
    }
}

window.addEventListener("keydown", (event) => {
    if (!theCurrentPlayer || !theCurrentLevel) return;//so the user can still use wasd for their name before the gane loads

    if (isDropping) {//runs once the user has already clicked thr Q key to enter dropping mode, then clicked a number
        event.preventDefault();
        const key = event.key;//get the number
        const index = parseInt(key, 10) - 1;//correlate that number with which item the number represents
        const children = theCurrentPlayer.children;//get the item list

        let action = null;//for now
        if (!isNaN(index) && index >= 0 && index < children.length) {//check if it's a valid number
            action = new dropAction(theCurrentPlayer, children[index]);//create the drop action ("children[index]" is the item the number corresponds to)
        } 
        else //if not a valid number
        {
            logMessage("drop cancelled.");
        }
        isDropping = false;

        if (action !== null) //if something happened
        {
            action.execute();//now actually do the drop action

            // monsters (movement code)
            monstersTurn();
        }
        return;//since the purpose of this keyclick was to drop an item, we can just break out of the keydown event listener as it's served its purpose
    }

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
    } else if (event.key === "i" || event.key === "I") {
        action = new listInventoryAction(theCurrentPlayer);//also list inventory whenever the I key is peessed
    } else if (event.key === "q" || event.key === "Q") {
        const children = theCurrentPlayer.children;//get the list of the player's children
        if (children.length === 0) 
        {
            logMessage("you have nothing to drop!");
        } 
        else 
        {
            isDropping = true;
            logMessage("select item to drop (press 1-" + children.length + ") or any other key to cancel:");
            new listInventoryAction(theCurrentPlayer).execute();//lists the inventory so you know which number to press
        }
        event.preventDefault();//making sure the browser doesn't do anything
        return;
    }

    if (action !== null) {
        event.preventDefault();
        action.execute();//send in the movement code

        // monsters' turn.
        monstersTurn();
    }
});



