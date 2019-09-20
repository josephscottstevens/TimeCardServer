var express = require('express')
var bodyParser = require('body-parser')
const fs = require('fs');
const port = 3000;
var app = express();

function timeEntryToCsv(timeEntry) {
    return timeEntry.pin + "," + timeEntry.clockedInAt + "," + timeEntry.clockedOutAt + "\n";
}


// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// POST /login gets urlencoded bodies
app.post('/timeentry', urlencodedParser, function (req, res) {
    // todo async stuff
    console.log(req.body);
    fs.appendFile('timecardentry.txt', timeEntryToCsv(req.body), function (err) {
        if (err) {
            console.log('Error!', err);
            res.send('error');
        } else {
            console.log('Saved!');
            res.send('success');
        }
    });
})

// POST /api/users gets JSON bodies
app.post('/api/users', jsonParser, function (req, res) {
  // create user in req.body
})

app.listen(port, () => console.log(`App listening on port ${port}!`));