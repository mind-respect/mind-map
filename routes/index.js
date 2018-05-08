var express = require('express');
var router = express.Router();
var isDebug = 'development' === process.env.debug;
const requireJsConfig = require("../requirejsConfig");
var bublGuruFlow = "";
const config = require('../config.json');
//var webshot = require('webshot');
//var uuid = require("node-uuid");
router.get('/', function (req, res, next) {
    res
        .render(
        'index',
        {
            isDebug: isDebug,
            bust: process.env.bust,
            usernameForBublGuru : "",
            graphElementTypeForBublGuru: "",
            graphElementShortIdForBublGuru : "",
            bublGuruFlow: "landing",
            requireJsConfig: requireJsConfig,
            config: config
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
            graphElementShortIdForBublGuru : "",
            bublGuruFlow: "centersCloud",
            requireJsConfig: requireJsConfig,
            config: config
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
            graphElementShortIdForBublGuru : req.params.graphElementShortId,
            bublGuruFlow: bublGuruFlow,
            requireJsConfig: requireJsConfig,
            config: config
        }
    );
});

router.get('/schemas', function (req, res, next) {
    res
        .render(
        'index',
        {
            isDebug: isDebug,
            bust: process.env.bust,
            usernameForBublGuru : "",
            graphElementTypeForBublGuru : "",
            graphElementShortIdForBublGuru : "",
            bublGuruFlow: "schemaList",
            requireJsConfig: requireJsConfig,
            config: config
        }
    );
});
//router.post('/node-service/html-to-image', function (req, res, next) {
//    var filePath = "public/export/image-" + uuid.v4()  + ".png";
//    webshot(
//        //req.body.html,
//        'http://localhost:8888/user/asdvoij/graph/vertex/a62684da-784a-4ad5-8a8b-950fcd217cfe',
//        filePath,
//        {
//            //siteType:'html'
//            takeShotOnCallback:true
//        }, function(err) {
//        // screenshot now saved to hello_world.png
//    });
//    res.send(req.body.html);
//});

module.exports = router;
