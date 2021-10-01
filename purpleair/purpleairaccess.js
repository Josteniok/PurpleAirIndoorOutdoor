'use strict';

const purpleAirApiReadKey = "ADB7BE2F-17CD-11EC-BAD6-42010A800017";
const outdoorsensorid = "121389";
const indoorsensorid = "125241";
// Initial pull
getAqi(indoorsensorid, 'indooraqi', 'indoor-column', 'indoordetails');
getAqi(outdoorsensorid, 'outdooraqi', 'outdoor-column', 'outdoordetails');
// Repeat pulls
let indoorAQI = setInterval(getAqi, 2000, indoorsensorid, 'indooraqi', 'indoor-column', 'indoordetails');
let outdoorAQI = setInterval(getAqi, 2000, outdoorsensorid, 'outdooraqi', 'outdoor-column', 'outdoordetails');

function getAqi(sensorid, docid, gridid, detailid) {
    let customHeader = new Headers();
    customHeader.append('X-API-Key', purpleAirApiReadKey);
    let initObject = {
        method: 'GET', headers: customHeader,
    };
    fetch("https://api.purpleair.com/v1/sensors/"+sensorid, initObject)
    .then(response => response.json())
    .then(function (sensorData) {
        let pm25data = sensorData.sensor["pm2.5"];
        let aqi = calcAQI(pm25data);
        document.getElementById(docid).innerHTML = String(aqi.toFixed(0));
        document.getElementById(gridid).style.backgroundColor = getBGColorForAQI(aqi);
        document.getElementById(detailid).appendChild(createDetailsTable(sensorData));
    })
    .catch(function (err) {
        console.log("ERROR: ", err);
    });
}

function createDetailsTable(sensorData) {
    let detailstable = document.createElement('table');
    let detailstablebody = document.createElement('tbody');

    let row1 = document.createElement('tr');
    let row1data1 = document.createElement('td');
    row1data1.innerHTML = "row 1 test";
    let row2 = document.createElement('tr');
    let row2data1 = document.createElement('td');
    row2data1.innerHTML = "row 2 test";
    row1.appendChild(row1data1);
    row2.appendChild(row2data1);
    detailstablebody.appendChild(row1);
    detailstablebody.appendChild(row2);

    detailstable.appendChild(detailstablebody);

    return detailstable
}

function calcAQI(pm25) {
    let bphi = 12.0;
    let bplo = 0.0;
    let aqhi = 50;
    let aqlo = 0;
    switch (true) {
        case (pm25 <= 12.0):
            break;
        case (pm25 > 12.0 && pm25 <=35.4):
            bphi = 35.4;
            bplo = 12.1;
            aqhi = 100;
            aqlo = 51;
            break;
        case (pm25 > 35.4 && pm25 <=55.4):
            bphi = 55.4;
            bplo = 35.5;
            aqhi = 150;
            aqlo = 101;
            break;
        case (pm25 > 55.4 && pm25 <=150.4):
            bphi = 150.4;
            bplo = 55.5;
            aqhi = 200;
            aqlo = 151;
            break;
        case (pm25 > 150.4 && pm25 <= 250.4):
            bphi = 250.4;
            bplo = 150.5;
            aqhi = 300;
            aqlo = 201;
            break;
        case (pm25 > 250.4 && pm25 <= 350.4):
            bphi = 350.4;
            bplo = 250.5;
            aqhi = 400;
            aqlo = 301;
            break;
        case (pm25 > 350.4 && pm25 <= 500.4):
            bphi = 500.4;
            bplo = 350.5;
            aqhi = 500;
            aqlo = 401;
            break;
        default:
            break;
    }
    let aqi = ((aqhi - aqlo)/(bphi - bplo))*(pm25 - bplo) + aqlo;
    return aqi;
}

function getBGColorForAQI(aqi) {
    switch (true) {
        case (aqi <= 50):
            return 'green';
        case (aqi > 50 && aqi <= 100):
            return 'yellow';
        case (aqi > 100 && aqi <= 150):
            return 'orange';
        case (aqi > 150 && aqi <= 200):
            return 'red';
        case (aqi > 200 && aqi <= 300):
            return 'purple';
        case (aqi > 300):
            return 'maroon';
        default:
            return 'green';
    }
}