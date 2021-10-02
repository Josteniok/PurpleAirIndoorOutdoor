'use strict';

const purpleAirApiReadKey = "ADB7BE2F-17CD-11EC-BAD6-42010A800017";
const outdoorsensorid = "121389";
const indoorsensorid = "125241";
// Initial pull
getAqi(indoorsensorid, 'indoor');
getAqi(outdoorsensorid, 'outdoor');
// Repeat pulls
let indoorAQI = setInterval(getAqi, 2000, indoorsensorid, 'indoor');
let outdoorAQI = setInterval(getAqi, 2000, outdoorsensorid, 'outdoor');

function getAqi(sensorid, location) {
    let customHeader = new Headers();
    customHeader.append('X-API-Key', purpleAirApiReadKey);
    let initObject = {
        method: 'GET', headers: customHeader,
    };
    // DOM locations
    let docid = location + "aqi";
    let gridid = location + "-column";
    let pm1id = location + "pm1.0";
    let pm25id = location + "pm2.5";
    let pm10id = location + "pm10.0";

    fetch("https://api.purpleair.com/v1/sensors/"+sensorid, initObject)
    .then(response => response.json())
    .then(function (sensorData) {
        let pm1data = sensorData.sensor["pm1.0"];
        let pm25data = sensorData.sensor["pm2.5"];
        let pm10data = sensorData.sensor["pm10.0"];
        let pm25_10minutes = sensorData.sensor["stats"]["pm2.5_10minute"];
        let pm25_cf_1 = sensorData.sensor["pm2.5_cf_1"]
        let humidity = sensorData.sensor["humidity"];
        let correctedpm25 = correctPM25(pm25_cf_1, humidity);
        let aqi = calcAQI(correctedpm25);
        document.getElementById(docid).innerHTML = String(aqi.toFixed(0));
        document.getElementById(gridid).style.backgroundColor = getBGColorForAQI(aqi);
        document.getElementById(pm1id).innerHTML = String(pm1data);
        document.getElementById(pm25id).innerHTML = String(pm25data);
        document.getElementById(pm10id).innerHTML = String(pm10data);
    })
    .catch(function (err) {
        console.log("ERROR: ", err);
    });
}

function correctPM25(pm25cf, humidity) {
    return ((0.52 * pm25cf) - (0.085 * humidity) + 5.71);
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