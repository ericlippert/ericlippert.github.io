"use strict";

const results = document.getElementById("testresults");
results.innerText += test(testGrid_1);
function testGrid_1()
{
    const g = new Grid(5, 4, "X");
    const r = g.toString();
    assertEqual(r, "XXXXX\nXXXXX\nXXXXX\nXXXXX");
    assertEqual(g.get(3, 2), "X");
    g.set(3, 2, "Y");
    assertEqual(g.get(3, 2), "Y");
}
