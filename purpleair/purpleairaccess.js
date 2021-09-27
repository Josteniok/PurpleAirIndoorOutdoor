'use strict';

let myVar = setInterval(myTimer, 1000);

function myTimer() {
  let d = new Date();
  let t = d.toLocaleTimeString();
  document.getElementById("demo").innerHTML = t;
}