var express = require('express');
var app = express();
var cors = require('cors');
var moment = require('moment');

var { queryHandler } = require('./utils');
var { dbClass } = require('./db');
const db = new dbClass();

///top/confirmed?observation_date=yyyy-mm-dd&max_results=2
app.use(cors())
app.use(queryHandler);
app.get('/top/confirmed', async function (req, res) {
    await db.init();
    const observation_date = req.query.observation_date;
    const max_results = req.query.max_results;
    var result = {};
    var dates = [];
    var total = null;
    try {
        result = await db.query({
            text: `SELECT * FROM ${db.table} ${observation_date ? `WHERE "ObservationDate" = $1` : ''}  ORDER BY "Confirmed" DESC ${max_results ? `LIMIT ${max_results}` : ''}`,
            values: observation_date && [db.parseDate(observation_date)]
        });
        dates = await db.query(`SELECT DISTINCT "ObservationDate" FROM ${db.table};`);
        dates = dates.rows.map(d => moment(d.ObservationDate, 'YYYY-MM-DD').format('YYYY-MM-DD'));
        total = await db.query(`SELECT COUNT(*) FROM ${db.table};`);
        total = total.rows[0].count
    } catch (error) {
        return res.status(400).json({message: error.message});
    }
    if (result.rowCount === 0) {
        return res.status(400).json({message: 'No record found!'});
    } else {
        return res.status(200).json({
            observation_date: observation_date,
            countries: result.rows,
            dates,
            total,
        });
    }
})

var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("DW Morgan API listening at http://%s:%s", host, port);
})