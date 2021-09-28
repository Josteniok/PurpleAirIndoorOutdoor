'use strict';

// let myVar = setInterval(myTimer, 1000);
const purpleAirApiReadKey = "ADB7BE2F-17CD-11EC-BAD6-42010A800017";
const outdoorsensorid = "121389";
const indoorsensorid = "125241";
let myVar = getAqi(outdoorsensorid);

function myTimer() {
  let d = new Date();
  let t = d.toLocaleTimeString();
  document.getElementById("demo").innerHTML = t;
}

function getAqi(sensorid) {
    let customHeader = new Headers();
    customHeader.append('X-API-Key', purpleAirApiReadKey);
    let initObject = {
        method: 'GET', headers: customHeader,
    };
    fetch("https://api.purpleair.com/v1/sensors/"+sensorid, initObject)
    .then(function (response) {
        const sensorData = response.json().result;
        document.getElementById("demo").innerHTML = String(sensorData.sensor["pm2.5"]);
    })
    .catch(function (err) {
        console.log("Something went wrong!", err);
    });
    /*let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const sensorData = JSON.parse(this.responseText);
            document.getElementById("demo").innerHTML = String(sensorData.sensor["pm2.5"]);
        }
    }
    xhttp.open("GET", "https://api.purpleair.com/v1/sensors/"+sensorid, true);
    xhttp.setRequestHeader('X-API-Key', purpleAirApiReadKey);
    xhttp.send();*/
}