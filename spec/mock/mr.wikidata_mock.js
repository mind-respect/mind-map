/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "mr.wikidata"
], function ($, Wikidata) {
    "use strict";
    var api = {};
    api.applyDefaultMocks = function(){
        var spies = {};
        spies["getWikipediaUrlFromWikidataUri"] = spyOn(Wikidata, "getWikipediaUrlFromWikidataUri").and.callFake(function (wikidataUri) {
            return $.Deferred().resolve(
                "//dummyWikipediaUrl"
            );
        });
        return spies;
    };
    return api;
});