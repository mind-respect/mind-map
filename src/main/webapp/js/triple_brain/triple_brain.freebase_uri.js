/*
 * Copyright Mozilla Public License 1.1
 */
define([], function(){
    var api = {};
    api.key = "AIzaSyBHOqdqbswxnNmNb4k59ARSx-RWokLZhPA";
    api.BASE_URL = "https://www.googleapis.com/freebase/v1";
    api.SEARCH_URL = api.BASE_URL + "/search";
    api.IMAGE_URL = api.BASE_URL + "/image";
    api.thumbnailImageUrlFromFreebaseId = function (freebaseId) {
        var options = {
            key:api.key,
            maxwidth:55,
            errorid:"/freebase/no_image_png"
        };
        return api.IMAGE_URL + freebaseId + "?" + $.param(options);
    };
    api.freebaseIdToURI = function (freebaseId) {
        return "http://rdf.freebase.com/rdf" + freebaseId;
    };
    api.idInFreebaseURI = function (freebaseURI) {
        return freebaseURI.replace("http://rdf.freebase.com/rdf", "");
    };
    api.isOfTypeTypeFromTypeId = function (typeId) {
        return typeId == "/type/type";
    };
    api.isFreebaseUri = function (uri) {
        return $.url(uri).attr()
            .host
            .toLowerCase()
            .indexOf("freebase.com") != -1;
    };
    return api;
});