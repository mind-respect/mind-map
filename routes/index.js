var express = require('express');
var router = express.Router();
var isDebug = 'development' === process.env.debug;
router.get('/', function (req, res, next) {
    res
        .render(
        'index',
        {
            isDebug: isDebug,
            bust: process.env.bust,
            usernameForBublGuru : "",
            graphElementTypeForBublGuru: "",
            graphElementShortIdForBublGuru : ""
        }
    );
});
router.get('/user/:username', function (req, res, next) {
    res
        .render(
        'index',
        {
            isDebug: isDebug,
            bust: process.env.bust,
            usernameForBublGuru : req.params.username,
            graphElementTypeForBublGuru: "",
            graphElementShortIdForBublGuru : ""
        }
    );
});
router.get('/user/:username/graph/:graphElementType/:graphElementShortId', function (req, res, next) {
    res
        .render(
        'index',
        {
            isDebug: isDebug,
            bust: process.env.bust,
            usernameForBublGuru : req.params.username,
            graphElementTypeForBublGuru : req.params.graphElementType,
            graphElementShortIdForBublGuru : req.params.graphElementShortId
        }
    );
});

module.exports = router;
