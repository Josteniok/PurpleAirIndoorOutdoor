'use strict';

// let myVar = setInterval(myTimer, 1000);
const purpleAirApiReadKey = 'ADB7BE2F-17CD-11EC-BAD6-42010A800017';
const outdoorsensorid = '121389';
const indoorsensorid = '125241';
let myVar = getAqi(outdoorsensorid);

function myTimer() {
  let d = new Date();
  let t = d.toLocaleTimeString();
  document.getElementById("demo").innerHTML = t;
}

function getAqi(sensorid) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const sensorData = JSON.parse(this.responseText);
            document.getElementById("demo").innerHTML = sensorData;
        }
    }
    xhttp.setRequestHeader('X-API-Key', purpleAirApiReadKey);
    xhttp.open("GET", "https://api.purpleair.com/v1/sensors/"+sensorid, true);
    xhttp.send();
}