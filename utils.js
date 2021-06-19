var moment = require('moment');

module.exports.queryHandler = function (req, res, next) {
    const error = [];
    const observation_date = req.query.observation_date;
    const max_results = req.query.max_results;
    const page = req.query.page;

    if (observation_date) {
        if (!moment(new Date(observation_date), 'YYYY-MM-DD').isValid()) {
            error.push({ message: 'Invalid observation date! Please make your sure the date format is YYYY-MM-DD.' });
        }
    }
    if (max_results) {
        if (max_results.toLowerCase() !== 'max') {
            if (!Number.isInteger(+max_results)) {
                error.push({ message: 'Invalid max result value!' });
            }
        }
    }
    if (page) {
        if (!Number.isInteger(+page)) {
            error.push({ message: 'Invalid page number!' });
        }
    }
    if (error.length > 0) return res.status(400).json(error);
    next();
}