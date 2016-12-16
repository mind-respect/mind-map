/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.wikidata",
    "triple_brain.wikidata_uri",
    "triple_brain.language_manager"
], function ($, Wikidata, WikidataUri, LanguageManager) {
    "use strict";
    var api = {};
    api.build = function () {
        return new WikiDataAutocompleteProvider();
    };
    return api;
    function WikiDataAutocompleteProvider() {
        var self = this;
        this.getFetchMethod = function (searchTerm) {
            var url = WikidataUri.BASE_URL + "/w/api.php?action=wbsearchentities&language=" +
                LanguageManager.getBrowserLocale() +
                "&uselang=" + LanguageManager.getBrowserLocale() +
                "&format=json&search=" +
                searchTerm;
            return $.ajax({
                type: 'GET',
                dataType: "jsonp",
                url: url
            });
        };
        this.formatResults = function (searchResults) {
            return $.map(searchResults.search, function (searchResult) {
                var format = {
                    nonFormattedSearchResult: searchResult,
                    comment: searchResult.description,
                    label: searchResult.match.text,
                    value: searchResult.match.text,
                    source: "Wikidata.org",
                    uri: searchResult.url,
                    provider: self
                };
                format.somethingToDistinguish = searchResult.description;
                return format;
            });
        };
        this.getMoreInfoForSearchResult = function (searchResult, callback) {
            Wikidata.getImageForWikidataUri(searchResult.uri).then(function(image){
                callback({
                        conciseSearchResult: searchResult,
                        title: searchResult.label,
                        text: searchResult.somethingToDistinguish,
                        image: image
                    }
                );
            }).fail(function(){
                callback({
                        conciseSearchResult: searchResult,
                        title: searchResult.label,
                        text: searchResult.somethingToDistinguish
                    }
                );
            });
        };
        this.isActive = function(){
            return Wikidata.isActive();
        };
    }
});