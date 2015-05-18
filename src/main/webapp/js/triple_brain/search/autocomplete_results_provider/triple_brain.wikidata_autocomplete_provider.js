/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.wikidata_uri",
    "triple_brain.language_manager",
    "triple_brain.image"
], function ($, WikidataUri, LanguageManager, Image) {
    "use strict";
    var api = {};
    api.build = function () {
        return new Self();
    };
    return api;
    function Self() {
        var self = this;
        this.getFetchMethod = function (searchTerm) {
            var url = WikidataUri.BASE_URL + "/w/api.php?action=wbsearchentities&language=" +
                LanguageManager.getBrowserLocale() +
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
                    label: searchResult.label,
                    value: searchResult.label,
                    source: "Wikidata.org",
                    uri: searchResult.url,
                    provider: self
                };
                format.somethingToDistinguish = searchResult.description;
                return format;
            });
        };
        this.getMoreInfoForSearchResult = function (searchResult, callback) {
            var wikidataId = WikidataUri.idInWikidataUri(
                searchResult.uri
            );
            var url = WikidataUri.BASE_URL + "/w/api.php?action=wbgetentities&ids=" +
                wikidataId + "&languages=en&props=claims&format=json";
            $.ajax({
                type: 'GET',
                dataType: "jsonp",
                url: url
            }).then(function (result) {
                return imageUrlFromSearchResult(result, wikidataId);
            }).then(function (image) {
                callback({
                        conciseSearchResult: searchResult,
                        title: searchResult.label,
                        text: searchResult.somethingToDistinguish,
                        image: image
                    }
                );
            });
        };
        function imageUrlFromSearchResult(result, wikidataId) {
            var deferred = $.Deferred();
            var claims = result.entities[wikidataId].claims;
            if (claims === undefined) {
                deferred.resolve();
                return;
            }
            var imageRelation = claims.P18;
            if (imageRelation === undefined) {
                deferred.resolve();
                return;
            }
            var imageName = imageRelation[0].mainsnak.datavalue.value;
            var thumbUrl = WikidataUri.thumbUrlForImageName(imageName);
            Image.getBase64OfExternalUrl(
                thumbUrl
            ).then(function (imageBase64) {
                deferred.resolve(
                    Image.withBase64ForSmallAndUrlForBigger(
                        imageBase64,
                        WikidataUri.rawImageUrlFromThumbUrl(thumbUrl)
                    )
                );
            });
            return deferred.promise();
        }
    }
});