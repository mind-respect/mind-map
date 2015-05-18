/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define(["md5"], function (MD5) {
    "use strict";
    var api = {};
    api.BASE_URL = "//www.wikidata.org";
    api.idInWikidataUri = function (uri) {
        return uri.substr(
            uri.lastIndexOf("/") + 1
        );
    };
    api.thumbUrlForImageId = function (imageName) {
        imageName = replaceWhiteSpace(imageName);
        var md5 = MD5(imageName);
        var firstChar = md5[0];
        var firstAndSecondChar = firstChar + md5[1];
        imageName = replaceParenthesis(
            encodeURIComponent(
                imageName
            )
        );
        return "//upload.wikimedia.org/wikipedia/commons/thumb/" + firstChar + "/" + firstAndSecondChar + "/" +
            imageName + "/60px-" +
            imageName;
    };
    return api;
    function replaceWhiteSpace(imageName) {
        return imageName.replace(/ /g, "_");
    }

    function replaceParenthesis(imageName) {
        return imageName.replace(/\(/g, "%28").replace(/\)/g, "%29");
    }
});