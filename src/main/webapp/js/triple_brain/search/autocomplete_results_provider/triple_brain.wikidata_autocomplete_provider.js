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
            }).success(function (result) {
                imageUrlFromSearchResult(result, wikidataId, function (imageUrl) {
                    callback({
                            conciseSearchResult: searchResult,
                            title: searchResult.label,
                            text: searchResult.somethingToDistinguish,
                            imageUrl: imageUrl
                        }
                    );
                });

            });
        };
        function imageUrlFromSearchResult(result, wikidataId, callback) {
            var imageUrl = "";
            var claims = result.entities[wikidataId].claims;
            if (claims === undefined) {
                return imageUrl;
            }
            var imageRelation = claims.P18;
            if (imageRelation === undefined) {
                callback(imageUrl);
                return;
            }
            var imageId = imageRelation[0].mainsnak.datavalue.value;
            imageUrl = Image.getBase64OfExternalUrl(
                WikidataUri.thumbUrlForImageId(imageId),
                function (base64) {
                    console.log(base64);
                    callback(imageUrl);
                }
            );
        }
    }
});