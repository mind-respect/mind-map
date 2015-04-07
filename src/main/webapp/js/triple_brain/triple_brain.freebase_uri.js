/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.user_service"
], function (UserService) {
    var baseUrl = "https://www.googleapis.com/freebase/v1",
        api = {
            key: "AIzaSyBHOqdqbswxnNmNb4k59ARSx-RWokLZhPA",
            BASE_URL: baseUrl,
            MQL_READ_URL: baseUrl + "/mqlread",
            SEARCH_URL: baseUrl + "/search",
            IMAGE_URL: baseUrl + "/image",
            DESCRIPTION_URL: baseUrl + "/text",
            DESCRIPTION_KEY: "/common/topic/description"
        },
        _freebaseFormattedUserLocales,
        _freebaseUserLocalesArray;
    api.thumbnailImageUrlFromFreebaseId = function (freebaseId) {
        var options = {
            key: api.key,
            maxwidth: 55,
            errorid: "/freebase/no_image_png"
        };
        return api.IMAGE_URL + freebaseId + "?" + $.param(options);
    };
    api.freebaseIdToUri = function (freebaseId) {
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
    api.getFreebaseFormattedUserLocales = function () {
        if (_freebaseFormattedUserLocales === undefined) {
            _freebaseFormattedUserLocales = getUserFreebaseLocalesArray().join(",");
        }
        return _freebaseFormattedUserLocales;
    };
    api.getMqlReadLocale = function () {
        return "/lang/" + getUserFreebaseLocalesArray()[0];
    };
    api.descriptionInFreebaseResult = function (object) {
        return object[api.DESCRIPTION_KEY] === undefined ?
            "" : object[api.DESCRIPTION_KEY][0];
    };
    return api;
    function getUserFreebaseLocalesArray() {
        if (_freebaseUserLocalesArray === undefined) {
            _freebaseUserLocalesArray = [];
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
                ],
                preferredLocales = UserService.authenticatedUserInCache().preferred_locales;
            $.each(preferredLocales, function () {
                var preferredLocale = this;
                $.each(freebaseAllowedLocales, function () {
                    var freebaseAllowedLocale = this;
                    if (preferredLocale.indexOf(freebaseAllowedLocale) !== -1) {
                        _freebaseUserLocalesArray.push(freebaseAllowedLocale);
                        return -1;
                    }
                });
            });
        }
        return _freebaseUserLocalesArray;
    }
})
;