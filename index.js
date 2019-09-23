import express from 'express';
import { json } from 'body-parser';
import { appendFile, readFile } from 'fs';
var csv = require("csvtojson");

const port = 3000;
const app = express();

function clockinToCsv(timeEntry) {
    return timeEntry.pin + "," + timeEntry.clockedInAt + "\n";
}

function clockoutToCsv(timeEntry) {
    return timeEntry.pin + "," + timeEntry.clockedOutAt + "," + timeEntry.tipsCollected + "\n";
}

function readJson(res, fileName) {
    csv()
    .on('error',(err)=>{
        console.log(err)
        res.send("error");
    })
    .fromFile(fileName)
    .then(function(data) {
        console.log(data);
        res.send(data);
    });
}

var jsonParser = json();

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.post('/clockin', jsonParser, function (req, res) {
    console.log(req.body);
    appendFile('data/clockin.csv', clockinToCsv(req.body), function (err) {
        if (err) {
            console.log('Error!', err);
            res.send('error');
        } else {
            console.log('Saved!');
            res.send('success');
        }
    });
});

app.post('/clockout', jsonParser, function (req, res) {
    console.log(req.body);
    appendFile('data/clockout.csv', clockoutToCsv(req.body), function (err) {
        if (err) {
            console.log('Error!', err);
            res.send('error');
        } else {
            console.log('Saved!');
            res.send('success');
        }
    });
});

app.get('/jobroles/', function (req, res) {
    readJson(res, 'data/jobroles.csv');
});

app.get('/employees', function (req, res) {
    readJson(res, 'data/employees.csv');
});

app.get('/timeentrystatus', function (req, res) {
    csv()
    .on('error',(err)=>{
        console.log(err)
        res.send("error");
    })
    .fromFile('data/clockin.csv')
    .then(function(data) {
        console.log(data);
        Math.max(data)
        res.send(data);
    });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));