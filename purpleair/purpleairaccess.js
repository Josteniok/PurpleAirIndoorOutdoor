'use strict';

// See https://www.airnow.gov/sites/default/files/2020-05/aqi-technical-assistance-document-sept2018.pdf
// for AQI calculation specifics.

const purpleAirApiReadKey = "ADB7BE2F-17CD-11EC-BAD6-42010A800017";
const outdoorsensorindex = "121389";
const indoorsensorindex = "125241";
const sensorgroupid = "717";
// Fields object
const Fields = {
    pm1: 'pm1.0',
    pm25: 'pm2.5',
    pm10: 'pm10.0',
    pm25cf: 'pm2.5_cf_1',
    humidity: 'humidity',
    lastseen: 'last_seen',
    um03: '0.3_um_count',
    um05: '0.5_um_count',
    um1: '1.0_um_count',
    um25: '2.5_um_count',
    um5: '5.0_um_count',
    um10: '10.0_um_count'
};
// Initial pull
getAqi(sensorgroupid);
// Repeat pulls
let indoorAQI = setInterval(getAqi, 120000, sensorgroupid);

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
        + ',' + Fields.lastseen
        + ',' + Fields.um03
        + ',' + Fields.um05
        + ',' + Fields.um1
        + ',' + Fields.um25
        + ',' + Fields.um5
        + ',' + Fields.um10;

    fetch("https://api.purpleair.com/v1/groups/"+groupid+"/members?fields="+sensorfields, initObject)
    .then(response => response.json())
    .then(function (sensorData) {
        let sensorDataFields = sensorData.fields;
        sensorData.data.forEach((sensor) => {
            if (sensor[0] == indoorsensorindex) {
                injectSensorData("indoor", sensor, sensorDataFields);
            } else if (sensor[0] == outdoorsensorindex) {
                injectSensorData("outdoor", sensor, sensorDataFields);
            }
        })
    })
    .catch(function (err) {
        console.log("ERROR: ", err);
    });
}

function injectSensorData(location, sensorData, sensorDataFields) {
    const pm1data = sensorData[sensorDataFields.indexOf(Fields.pm1)];
    const pm25data = sensorData[sensorDataFields.indexOf(Fields.pm25)];
    const pm10data = sensorData[sensorDataFields.indexOf(Fields.pm10)];
    const pm25_cf_1data = sensorData[sensorDataFields.indexOf(Fields.pm25cf)];
    const humiditydata = sensorData[sensorDataFields.indexOf(Fields.humidity)];
    const lastseendata = sensorData[sensorDataFields.indexOf(Fields.lastseen)];
    const um03data = sensorData[sensorDataFields.indexOf(Fields.um03)];
    const um05data = sensorData[sensorDataFields.indexOf(Fields.um05)];
    const um1data = sensorData[sensorDataFields.indexOf(Fields.um1)];
    const um25data = sensorData[sensorDataFields.indexOf(Fields.um25)];
    const um5data = sensorData[sensorDataFields.indexOf(Fields.um5)];
    const um10data = sensorData[sensorDataFields.indexOf(Fields.um10)];

    // DOM locations
    const docid = location + "aqi";
    const gridid = location + "-column";
    const pm1id = location + "pm1.0";
    const pm25id = location + "pm2.5";
    const pm10id = location + "pm10.0";
    const datatimeid = location + "datatime";
    const um03id = location + "0.3um";
    const um05id = location + "0.5um";
    const um1id = location + "1.0um";
    const um25id = location + "2.5um";
    const um5id = location + "5.0um";
    const um10id = location + "10.0um";

    const correctedpm25 = correctPM25(pm25_cf_1data, humiditydata);
    const aqi = calcAQI(correctedpm25);
    document.getElementById(docid).innerHTML = String(aqi.toFixed(0));
    document.getElementById(gridid).style.backgroundColor = getBGColorForAQI(aqi);
    document.getElementById(pm1id).innerHTML = String(pm1data);
    document.getElementById(pm25id).innerHTML = String(pm25data);
    document.getElementById(pm10id).innerHTML = String(pm10data);
    document.getElementById(datatimeid).innerHTML = formattedTime(lastseendata);
    document.getElementById(um03id).innerHTML = String(um03data);
    document.getElementById(um05id).innerHTML = String(um05data);
    document.getElementById(um1id).innerHTML = String(um1data);
    document.getElementById(um25id).innerHTML = String(um25data);
    document.getElementById(um5id).innerHTML = String(um5data);
    document.getElementById(um10id).innerHTML = String(um10data);
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
    let bphi = 9.0;
    let bplo = 0.0;
    let aqhi = 50;
    let aqlo = 0;
    switch (true) {
        case (pm25 <= 9.0):
            break;
        case (pm25 > 9.0 && pm25 <=35.4):
            bphi = 35.4;
            bplo = 9.1;
            aqhi = 100;
            aqlo = 51;
            break;
        case (pm25 > 35.4 && pm25 <=55.4):
            bphi = 55.4;
            bplo = 35.5;
            aqhi = 150;
            aqlo = 101;
            break;
        case (pm25 > 55.4 && pm25 <=125.4):
            bphi = 125.4;
            bplo = 55.5;
            aqhi = 200;
            aqlo = 151;
            break;
        case (pm25 > 125.4 && pm25 <= 225.4):
            bphi = 225.4;
            bplo = 125.5;
            aqhi = 300;
            aqlo = 201;
            break;
        case (pm25 > 225.4):
            bphi = 500.0;
            bplo = 225.5;
            aqhi = 500;
            aqlo = 301;
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
            return 'rgb(0,228,0)';
        case (aqi > 50 && aqi <= 100):
            return 'rgb(255,255,0)';
        case (aqi > 100 && aqi <= 150):
            return 'rgb(255,126,0)';
        case (aqi > 150 && aqi <= 200):
            return 'rgb(255,0,0)';
        case (aqi > 200 && aqi <= 300):
            return 'rgb(143,63,151)';
        case (aqi > 300):
            return 'rgb(126,0,35)';
        default:
            return 'green';
    }
}