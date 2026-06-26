const inputbox = document.getElementById('inputbox');
const submitbutton = document.getElementById('submitbutton');
const outputtext = document.getElementById('outputtext');
const enteryourname = document.getElementById('enteryourname');

// let instead of var but let me know if var is better for this -jj
let storedData = "";

submitbutton.addEventListener('click', () => {
    storedData = inputbox.value;
    inputbox.style.display = 'none';
    enteryourname.style.display = 'none';
    submitbutton.style.display = 'none';
    console.log(storedData);
    outputtext.textContent = "hello " + storedData + ", welcome to the dungeon.";
    outputtext.classList.add("dungeon");
});
