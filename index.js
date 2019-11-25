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
const clockedout = "clockedout";
const clockedin = "clockedin";

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
    if (timeEntry.tipsCollected === undefined) {
        timeEntry.tipsCollected = "";
    }
    if (timeEntry.type === clockedin && timeEntry.tipsCollected) {
        //TODO: log error, can't have tip on clocked in
        console.error("Cannot collect tips on clock in");
    }
    if (timeEntry.type != clockedin && timeEntry.type != clockedout) {
        //TODO: log error, can't have tip on clocked in
        console.error(`invalid timeEntry type of ${timeEntry.type}`);
    }
    if (!timeEntry.tipsCollected) {
        // If there are no tips collected, set to the number 0 instead of null or undefined
        timeEntry.tipsCollected = 0;
    }
    return timeEntry.type + "," + timeEntry.pin + "," + timeEntry.time + "," + timeEntry.tipsCollected + "\n";
}

function getMostRecentTimeEntry(data, pin) {
    var mostRecentTimeEntry = 
        data
        .filter(t => t.pin == pin)
        .reduce(function(prev, current, ) {
            return (prev.time > current.time) ? prev : current
        }, {nodata:true});
    if (mostRecentTimeEntry.nodata) {
        return null;
    } else {
        return mostRecentTimeEntry;
    }
}

app.get('/clockedinstatus/:pin', function (req, res) {
    csv()
    .on('error',(err)=>{
        console.log(err)
        res.send("error");
    })
    .fromFile('data/timeentry.csv')
    .then(function(data) {
        const maxTimeEntry = getMostRecentTimeEntry(data, req.params.pin);
        var response = {};
        console.log(maxTimeEntry);
        if (maxTimeEntry === null) {
            // If user has never clocked in before
            response.type = clockedout;
            response.pin = req.params.pin;
            response.time = Date.now();
            response.tipsCollected = null;
        } else {
            response = maxTimeEntry;
        }
        res.send(response);
    });
});

app.post('/timeentry', jsonParser, function (req, res) {
    csv()
    .on('error',(err)=>{
        console.log(err)
        res.send("error");
    })
    .fromFile('data/timeentry.csv')
    .then(function(data) {
        const maxTimeEntry = getMostRecentTimeEntry(data, req.body.pin);
        var dataToWrite = {};
        if (!maxTimeEntry || maxTimeEntry.type == clockedout) {
            dataToWrite.type = clockedin;
            dataToWrite.pin = req.body.pin;
            dataToWrite.time = Date.now();
        } else if (maxTimeEntry.type == clockedin) {
            dataToWrite.type = clockedout;
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