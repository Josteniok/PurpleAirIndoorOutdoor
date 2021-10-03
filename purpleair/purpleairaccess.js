'use strict';

const purpleAirApiReadKey = "ADB7BE2F-17CD-11EC-BAD6-42010A800017";
const outdoorsensorindex = "121389";
const indoorsensorindex = "125241";
const sensorgroupid = "717";
// Fields object
const Fields = {
    pm1: 'pm1.0',
    pm1index: 1,
    pm25: 'pm2.5',
    pm25index: 2,
    pm10: 'pm10.0',
    pm10index: 3,
    pm25cf: 'pm2.5_cf_1',
    pm25cfindex: 4,
    humidity: 'humidity',
    humidityindex: 5,
    lastseen: 'last_seen',
    lastseenindex: 6
};
// Initial pull
getAqi(sensorgroupid);
// Repeat pulls
let indoorAQI = setInterval(getAqi, 2000, sensorgroupid);

function getAqi(groupid) {
    let customHeader = new Headers();
    customHeader.append('X-API-Key', purpleAirApiReadKey);
    let initObject = {
        method: 'GET', headers: customHeader,
    };

    // Sensor fields
    const sensorfields = Fields.pm1 
        + ',' + Fields.pm25 
        + ',' + Fields.pm10 
        + ',' + Fields.pm25cf 
        + ',' + Fields.humidity
        + ',' + Fields.lastseen;

    fetch("https://api.purpleair.com/v1/groups/"+groupid+"/members?fields="+sensorfields, initObject)
    .then(response => response.json())
    .then(function (sensorData) {
        sensorData.data.forEach((sensor) => {
            if (sensor[0] == indoorsensorindex) {
                injectSensorData("indoor", sensor);
            } else if (sensor[0] == outdoorsensorindex) {
                injectSensorData("outdoor", sensor);
            }
        })
    })
    .catch(function (err) {
        console.log("ERROR: ", err);
    });
}

function injectSensorData(location, sensorData) {
    const pm1data = sensorData[Fields.pm1index];
    const pm25data = sensorData[Fields.pm25index];
    const pm10data = sensorData[Fields.pm10index];
    const pm25_cf_1data = sensorData[Fields.pm25cfindex];
    const humiditydata = sensorData[Fields.humidityindex];
    const lastseendata = sensorData[Fields.lastseenindex];

    // DOM locations
    const docid = location + "aqi";
    const gridid = location + "-column";
    const pm1id = location + "pm1.0";
    const pm25id = location + "pm2.5";
    const pm10id = location + "pm10.0";
    const datatimeid = location + "datatime";

    const correctedpm25 = correctPM25(pm25_cf_1data, humiditydata);
    const aqi = calcAQI(correctedpm25);
    document.getElementById(docid).innerHTML = String(aqi.toFixed(0));
    document.getElementById(gridid).style.backgroundColor = getBGColorForAQI(aqi);
    document.getElementById(pm1id).innerHTML = String(pm1data);
    document.getElementById(pm25id).innerHTML = String(pm25data);
    document.getElementById(pm10id).innerHTML = String(pm10data);
    document.getElementById(datatimeid).innerHTML = formattedTime(lastseendata);
}

function correctPM25(pm25cf, humidity) {
    return ((0.52 * pm25cf) - (0.085 * humidity) + 5.71);
}

function formattedTime(unixtime) {
    const milliseconds = unixtime * 1000;
    const dateObject = new Date(milliseconds);
    return dateObject.toLocaleString();
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