const { Client } = require('pg');
const moment = require('moment');
const csv2json = require("csvtojson");
const pgformat = require('pg-format');
require('dotenv').config();


const csvFilePath = __dirname + "/data/covid_19_data.csv";
const table = 'public.covid_observations';
const createTableSQL = `CREATE TABLE IF NOT EXISTS ${table}
(
    "SNo" integer,
    "ObservationDate" date,
    "ProvinceState" text,
    "CountryRegion" text,
    "Last Update" date,
    "Confirmed" double precision,
    "Deaths" double precision,
    "Recovered" double precision
);

ALTER TABLE ${table}
    OWNER to postgres;`;


class dbClass {
    constructor() {
        try {
            this.table = table;
            this.client = new Client();
            this.client.connect();
        } catch (error) {
            console.log('err', error.message);
        }
        
    }
    async query(string) {
        const result = await this.client.query(string);
        return result;
    }
    async rawData() {
        return csv2json()
            .fromFile(csvFilePath)
            .then((jsonObj) => {
                return jsonObj
            });
    }
    parseDate(val) {
        const res = moment(new Date(val), 'MM-DD-YYYY').format('YYYY-MM-DD');
        if(res === 'Invalid date') return null;
        return res;
    }
    async init() {
        this.query(createTableSQL);
        const x = await this.query(`SELECT COUNT(*) FROM ${table}`);
        if (x.rows[0].count < 10) {
            const rawData = await this.rawData();
            const values = rawData.map(data => {
                const dates = [1, 4];
                const doubles = [5, 6, 7];
                const valuesResult = Object.values(data).map((v, i) => {
                    if(i === 0) return parseInt(v);
                    if (dates.includes(i)) return this.parseDate(v);
                    if (doubles.includes(i)) return parseFloat(v).toFixed(2);
                    return v;
                })
                return valuesResult;
            })
            const sqlString = pgformat(`INSERT INTO ${table} ("SNo","ObservationDate","ProvinceState","CountryRegion","Last Update","Confirmed","Deaths","Recovered") VALUES %L`, values);
            this.query(sqlString);
        }
    }
}

module.exports = { dbClass };