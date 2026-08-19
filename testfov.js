"use strict";

const fovResults = document.getElementById("testresults");//unique name so it doesn't clash with results in testgrid.js
fovResults.innerText += test(testMaskOpenRoom);
fovResults.innerText += test(testMaskPillar);
fovResults.innerText += test(canSeeCorrectTiles);

//turn a boolean mask grid into a picture (# = visible, space = hidden)
function readable(mask) {
    return mask.toString().split("true").join("#").split("false").join(" ");
}

function testMaskOpenRoom() {
    const map = new Grid(5, 5, " ");
    assertEqual(readable(whereVisible(map, 2, 2, 2)),//player at 2,2 with a 2 view radius
        "     \n ### \n ### \n ### \n     ");
            //  
            //           
            //    ###   
            //    ###   
            //    ###   
            //           
            //  
}

function testMaskPillar() {
    const map = new Grid(3, 5, " ");
    map.set(1, 2, "O");//pillar directly above the player 1,2
    assertEqual(readable(whereVisible(map, 1, 3, 3)),//player at 1,3 with a 3 view radius
        "   \n   \n # \n###\n###");


            //  blank
            //  blank
            //   #
            //  ###
            //  ###
    
}

function canSeeCorrectTiles() {
    const map = new Grid(5, 5, " ");
    map.set(0, 0, "┌"); map.set(1, 0, "─"); map.set(2, 0, "┐");
    map.set(0, 1, "│"); map.set(2, 1, "│");
    map.set(0, 2, "└"); map.set(1, 2, "─"); map.set(2, 2, "┘");
    assertEqual(readable(whereVisible(map, 1, 1, 2)),
        "###  \n###  \n###  \n     \n     ");


            //  ###
            //  ###
            //  ###
}