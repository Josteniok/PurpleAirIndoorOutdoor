'use strict';

const purpleAirApiReadKey = process.env.API_READ_KEY || "";
const outdoorsensorindex = process.env.OUTDOOR_SENSOR_ID || "";
const indoorsensorindex = process.env.INDOOR_SENSOR_INDEX || "";

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
    .then(response => response.json())
    .then(function (data) {
        document.getElementById(docid).innerHTML = "<pre>"+JSON.stringify(data, null, 2) +"</pre>"
    })
    .catch(function (err) {
        console.log("ERROR: ", err);
    });
}