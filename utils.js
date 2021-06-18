var moment = require('moment');

module.exports.queryHandler = function (req, res, next) {
    const error = [];
    const observation_date = req.query.observation_date;
    const max_results = req.query.max_results;
    if (observation_date) {
        if (!moment(new Date(observation_date), 'YYYY-MM-DD').isValid()) {
            error.push({ message: 'Invalid observation date! Please make your sure the date format is YYYY-MM-DD.' });
        }
    }
    if (max_results) {
        if (!Number.isInteger(+max_results)) {
            error.push({ message: 'Invalid max result value!' });
        }
    }
    if (error.length > 0) return res.status(400).json(error);
    next()
}