var express = require('express');
var router = express.Router();
var isDebug = 'development' === process.env.debug;
/* GET home page. */
router.get('/', function (req, res, next) {
    res
        .render(
        'index',
        {
            isDebug: isDebug,
            bust: process.env.bust,
            usernameForBublGuru : "",
            graphElementShortIdForBublGuru : ""
        }
    );
});
router.get('/:username', function (req, res, next) {
    res
        .render(
        'index',
        {
            isDebug: isDebug,
            bust: process.env.bust,
            usernameForBublGuru : req.params.username,
            graphElementShortIdForBublGuru : ""
        }
    );
});
router.get('/user/:username/graph/vertex/:graphElementShortId', function (req, res, next) {
    res
        .render(
        'index',
        {
            isDebug: isDebug,
            bust: process.env.bust,
            usernameForBublGuru : req.params.username,
            graphElementShortIdForBublGuru : req.params.graphElementShortId
        }
    );
});

module.exports = router;
