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
    .then(function(data){ //when parse finished, result will be emitted here.
        console.log(data);
        res.send(data);
    });
}

var jsonParser = json();

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

app.listen(port, () => console.log(`App listening on port ${port}!`));