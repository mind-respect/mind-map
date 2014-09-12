/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define(["triple_brain.user"], function(UserService){
    var api = {},
        _freebaseFormattedUserLocales;
    api.key = "AIzaSyBHOqdqbswxnNmNb4k59ARSx-RWokLZhPA";
    api.BASE_URL = "https://www.googleapis.com/freebase/v1";
    api.SEARCH_URL = api.BASE_URL + "/search";
    api.IMAGE_URL = api.BASE_URL + "/image";
    api.DESCRIPTION_URL = api.BASE_URL + "/text";
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
    api.getFreebaseFormattedUserLocales = function(){
        if(_freebaseFormattedUserLocales === undefined){
            var formattedLocales = [];
            var preferredLocales = UserService.authenticatedUserInCache().preferred_locales;
            var freebaseAllowedLocales = [
                "en",
                "es",
                "fr",
                "de",
                "it",
                "pt",
                "zh",
                "ja",
                "ko",
                "ru",
                "sv",
                "fi",
                "da",
                "nl",
                "el",
                "ro",
                "tr",
                "hu"
            ];
            $.each(preferredLocales, function(){
                var preferredLocale = this;
                $.each(freebaseAllowedLocales, function(){
                    var freebaseAllowedLocale = this;
                    if(preferredLocale.indexOf(freebaseAllowedLocale) !== -1){
                        formattedLocales.push(freebaseAllowedLocale);
                        return -1;
                    }
                });
            });
            _freebaseFormattedUserLocales = formattedLocales.join(",");
        }
        return _freebaseFormattedUserLocales;
    };
    return api;
});