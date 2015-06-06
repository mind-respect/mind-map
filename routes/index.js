var express = require('express');
var router = express.Router();
var isDebug = 'development' === process.env.debug;
/* GET home page. */
router.get('/', function (req, res, next) {
    res
        .render(
        'index',
        {
            isDebug:isDebug
        }
    );
});

module.exports = router;
