var express = require('express');
var router = express.Router();
var isDebug = 'development' === process.env.debug;
const extend = require('util')._extend;
const requireJsConfig = require("../requirejsConfig");
const config = require('../config.json');
//var webshot = require('webshot');
//var uuid = require("node-uuid");
const defaults = {
    isDebug: isDebug,
    bust: process.env.bust,
    usernameForBublGuru: '',
    graphElementTypeForBublGuru: '',
    graphElementShortIdForBublGuru: '',
    mrFlow: '',
    mrSubFlow: '',
    requireJsConfig: requireJsConfig,
    config: config
};

function useOptions(options) {
    return Object.assign(
        {},
        defaults,
        options
    )
}

router.get('/', function (req, res, next) {
    res
        .render(
            'index',
            useOptions({
                mrFlow: 'landing'
            })
        );
});
router.get('/login', function (req, res, next) {
    res
        .render(
            'index',
            useOptions({
                mrFlow: 'landing',
                mrSubFlow: 'login'
            })
        );
});
router.get('/register', function (req, res, next) {
    res
        .render(
            'index',
            useOptions({
                mrFlow: 'landing',
                mrSubFlow: 'register'
            })
        );
});
router.get('/forgot-password', function (req, res, next) {
    res
        .render(
            'index',
            useOptions({
                mrFlow: 'landing',
                mrSubFlow: 'forgot-password'
            })
        );
});
router.get('/user/:username', function (req, res, next) {
    res
        .render(
            'index',
            useOptions({
                usernameForBublGuru: req.params.username,
                mrFlow: 'centersCloud',
                mrSubFlow: 'forgot-password'
            })
        );
});
router.get('/user/:username/graph/:graphElementType/:graphElementShortId', function (req, res, next) {
    res
        .render(
            'index',
            useOptions({
                usernameForBublGuru: req.params.username,
                graphElementTypeForBublGuru: req.params.graphElementType,
                graphElementShortIdForBublGuru: req.params.graphElementShortId,
            })
        );
});

router.get('/schemas', function (req, res, next) {
    res
        .render(
            'index',
            useOptions({
                mrFlow: "schemaList"
            })
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
