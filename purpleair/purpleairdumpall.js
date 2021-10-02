'use strict';

const purpleAirApiReadKey = "ADB7BE2F-17CD-11EC-BAD6-42010A800017";
const outdoorsensorid = "121389";
const indoorsensorid = "125241";
getDetails(indoorsensorid, 'indoor');
getDetails(outdoorsensorid, 'outdoor');

function getDetails(sensorid, location) {
    let customHeader = new Headers();
    customHeader.append('X-API-Key', purpleAirApiReadKey);
    let initObject = {
        method: 'GET', headers: customHeader,
    };
    let docid = location + "details";
    fetch("https://api.purpleair.com/v1/sensors/"+sensorid, initObject)
    .then(function (response) {
        
    })
    .then(function (data) {
        document.getElementById(docid).innerHTML = String(data);
    })
    .catch(function (err) {
        console.log("ERROR: ", err);
    });
}