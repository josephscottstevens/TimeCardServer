import express from 'express';
import { json } from 'body-parser';
import { appendFile, readFile } from 'fs';
var csv = require("csvtojson");

const port = 3000;
const app = express();

function readJson(res, fileName, parser) {
    csv(parser)
    .on('error',(err)=>{
        console.log(err)
        res.send("error");
    })
    .fromFile(fileName)
    .then(function(data) {
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

app.get('/jobroles/', function (req, res) {
    readJson(res, 'data/jobroles.csv', {
        colParser:{
            "name":"string",
            "doesCashOut":function(item, head, resultRow, row , colIdx){
                return new Boolean(item);
            },
        },
        checkType:true
    });
});

app.get('/employees', function (req, res) {
    readJson(res, 'data/employees.csv', {
        colParser:{
            "firstname":"string",
            "middlename":"string",
            "lastname":"string",
            "pin":"number",
            "jobroles":function(item, head, resultRow, row , colIdx){
                // console.log("item", item);
                return item.split("|");
            },
        },
        checkType:true
    });
});

function timeentryToCsv(timeEntry) {
    return timeEntry.type + "," + timeEntry.pin + "," + timeEntry.time + "," + timeEntry.tipsCollected + "\n";
}

function getMostRecentTimeEntry(data, pin) {
    return data
           .filter(t => t.pin == pin)
           .reduce(function(prev, current, ) {
               return (prev.time > current.time) ? prev : current
           }, []);
}

app.get('/getclockedinstatus/:pin', function (req, res) {
    csv()
    .on('error',(err)=>{
        console.log(err)
        res.send("error");
    })
    .fromFile('data/timeentry.csv')
    .then(function(data) {
        const maxTimeEntry = getMostRecentTimeEntry(data, req.params.pin);
        var response = {};
        if (!Array.isArray(maxTimeEntry) || !maxTimeEntry.length) {
            // If user has never clocked in before, this is dumb data that represents that.
            response.type = "clockedout";
            response.pin = req.params.pin;
            response.time = Date.now();
            response.tipsCollected = null;
        } else {
            response = maxTimeEntry;
        }
        res.send(response);
    });
});

app.post('/entertime', jsonParser, function (req, res) {
    csv()
    .on('error',(err)=>{
        console.log(err)
        res.send("error");
    })
    .fromFile('data/timeentry.csv')
    .then(function(data) {
        const maxTimeEntry = getMostRecentTimeEntry(data, req.body.pin);
        var dataToWrite = {};
        if (maxTimeEntry.type == "clockedout") {
            dataToWrite.type = "clockedin";
            dataToWrite.pin = req.body.pin;
            dataToWrite.time = Date.now();
        } else if (maxTimeEntry.type == "clockedin") {
            dataToWrite.type = "clockedout";
            dataToWrite.pin = req.body.pin;
            dataToWrite.time = Date.now();
            dataToWrite.tipsCollected = req.body.tipsCollected;
        }
        appendFile('data/timeentry.csv', timeentryToCsv(dataToWrite), function (err) {
            if (err) {
                console.log('Error!', err);
                res.send('error');
            } else {
                console.log('Saved!');
                res.send(dataToWrite);
            }
        });
    });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));