var express = require('express');
var router = express.Router();
var isDebug = 'development' === process.env.debug;
/* GET home page. */
router.get('/', function (req, res, next) {
    res
        .render(
        'index',
        {
            isDebug:isDebug,
            bust: process.env.bust
        }
    );
});

module.exports = router;
