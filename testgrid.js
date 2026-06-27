"use strict";

const results = document.getElementById("testresults");
results.innerText += test(testGrid_1);
function testGrid_1()
{
    assertThrows(() => new Grid(-1, 4, "X"));
    assertThrows(() => new Grid(1, -4, "X"));
    const g = new Grid(5, 4, "X");
    assertEqual(g.toString(), "XXXXX\nXXXXX\nXXXXX\nXXXXX");
    assertEqual(g.get(3, 2), "X");
    g.set(3, 2, "Y");
    assertEqual(g.get(3, 2), "Y");
    assertThrows(() => g.get(-1, 0));
    assertThrows(() => g.get(0, -1));
    assertThrows(() => g.get(1, 5));
    assertThrows(() => g.get(5, 1));
}
// i think this file is supposed to test the grid-making file with specific examples to make sure it works. it's able to load functions from the other js file test.js because all the js files are loaded in html