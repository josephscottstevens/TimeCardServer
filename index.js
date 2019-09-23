import express from 'express';
import { json } from 'body-parser';
import { appendFile, readFile } from 'fs';

const port = 3000;
const app = express();

function clockinToCsv(timeEntry) {
    return timeEntry.pin + "," + timeEntry.clockedInAt + "\n";
}

function clockoutToCsv(timeEntry) {
    return timeEntry.pin + "," + timeEntry.clockedOutAt + "," + timeEntry.tipsCollected + "\n";
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

app.get('/jobroles', function (req, res) {
    readFile('data/jobroles.csv', null, function (err, data) {
        if (err) {
            console.log('Error!', err);
            res.send('error');
        } else {
            console.log('Saved!');
            res.send(data);
        }
    });
});

app.get('/employees', function (req, res) {
    readFile('data/employees.csv', null, function (err, data) {
        if (err) {
            console.log('Error!', err);
            res.send('error');
        } else {
            console.log('Saved!');
            res.send(data);
        }
    });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));