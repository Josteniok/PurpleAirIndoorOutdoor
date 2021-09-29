'use strict';

const purpleAirApiReadKey = "ADB7BE2F-17CD-11EC-BAD6-42010A800017";
const outdoorsensorid = "121389";
const indoorsensorid = "125241";
let indoorAQI = setInterval(getAqi, 20000, indoorsensorid, 'indooraqi');
// let outdoorAQI = setInterval(getAqi, 2000, outdoorsensorid, 'outdooraqi');

function getAqi(sensorid, docid) {
    let customHeader = new Headers();
    customHeader.append('X-API-Key', purpleAirApiReadKey);
    let initObject = {
        method: 'GET', headers: customHeader,
    };
    fetch("https://api.purpleair.com/v1/sensors/"+sensorid, initObject)
    .then(response => response.json())
    .then(function (sensorData) {
        document.getElementById(docid).innerHTML = String(sensorData.sensor["pm2.5"]);
    })
    .catch(function (err) {
        console.log("ERROR: ", err);
    });
}