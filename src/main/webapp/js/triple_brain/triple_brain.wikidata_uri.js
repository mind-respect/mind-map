/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define(["md5"], function (MD5) {
    "use strict";
    var api = {};
    api.BASE_URL = "//www.wikidata.org";
    api.idInWikidataUri = function(uri){
        return uri.substr(
            uri.lastIndexOf("/") + 1
        );
    };
    api.thumbUrlForImageId = function(imageId){
        var encodedImageId = api.encodeImageId(imageId);
        var md5 = MD5(encodedImageId);
        var firstChar = md5[0];
        var firstAndSecondChar = firstChar + md5[1];
        return "//upload.wikimedia.org/wikipedia/commons/thumb/"+firstChar+"/"+firstAndSecondChar+"/"+
            encodedImageId + "/60px-" +
            encodedImageId;
    };
    api.encodeImageId = function(imageId){
        return imageId.replace(/ /g, "_").replace(/\(/g,  "%28").replace(/\)/g, "%29");
    };
    return api;
});