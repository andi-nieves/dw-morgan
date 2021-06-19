var express = require('express');
var app = express();
var cors = require('cors');
var moment = require('moment');

var { queryHandler } = require('./utils');
var { dbClass } = require('./db');
const db = new dbClass();

app.use(cors())
app.use(queryHandler);

// get available records date list
app.get('/top/confirmed/dates', async function(req, res) {
    var dates = await db.query(`SELECT DISTINCT "ObservationDate" FROM ${db.table};`);
    dates = dates.map(d => moment(d.ObservationDate, 'YYYY-MM-DD').format('YYYY-MM-DD'));
    return res.status(200).json({
        dates,
    });
})
app.get('/top/confirmed', async function (req, res) {
    await db.init();
    const observation_date = req.query.observation_date;
    const max_results = req.query.max_results;
    var countries = {};
    var total = null;
    try {
        countries = await db.query({
            text: `SELECT "CountryRegion" as country, "Confirmed" as confirmed,	"Deaths" as deaths, "Recovered" as recovered FROM ${db.table} ${observation_date ? `WHERE "ObservationDate" = $1` : ''}  ORDER BY "Confirmed" DESC ${max_results && max_results.toLowerCase() !== 'max' ? `LIMIT ${max_results}` : ''}`,
            values: observation_date && [db.parseDate(observation_date)]
        });
        total = await db.query(`SELECT COUNT(*) FROM ${db.table};`);
        total = total[0].count
    } catch (error) {
        return res.status(400).json({message: error.message});
    }
    if (countries.length === 0) {
        return res.status(400).json({message: 'No record found!'});
    } else {
        return res.status(200).json({
            observation_date: observation_date,
            countries,
            total,
        });
    }
});

var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("DW Morgan API listening at http://%s:%s", host, port);
})