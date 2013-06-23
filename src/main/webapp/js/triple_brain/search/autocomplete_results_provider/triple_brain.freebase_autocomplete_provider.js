/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "jquery",
    "triple_brain.freebase"
], function (require, $, Freebase) {
    var api = {};
    api.forFetchingTypes = function () {
        return new FreebaseAutocompleteProvider({
            filter:'(all type:/type/type)'
        });
    };
    api.forFetchingAnything = function () {
        return new FreebaseAutocompleteProvider({});
    };
    api.toFetchForTypeId = function (typeId) {
        return new FreebaseAutocompleteProvider({
            filter:'(all type:' + typeId +')'
        });
    };
    api.fetchUsingOptions = function (options) {
        return new FreebaseAutocompleteProvider(
            options
        );
    };
    function FreebaseAutocompleteProvider(freebaseOptions) {
        var self = this;
        this.getFetchMethod = function (searchTerm) {
            var options = $.extend({
                query:searchTerm,
                key:freebaseInstance().key
            }, freebaseOptions);
            var url = freebaseInstance().SEARCH_URL + "?" + $.param(options);
            return $.ajax({
                type:'GET',
                dataType:"jsonp",
                url:url
            });
        };
        this.formatResults = function (searchResults) {
            return $.map(searchResults.result, function (searchResult) {
                var format = {
                    nonFormattedSearchResult: searchResult,
                    description : "",
                    label:searchResult.name,
                    value:searchResult.name,
                    source:"Freebase.com",
                    uri:freebaseInstance().freebaseIdToURI(searchResult.mid),
                    provider:self
                };
                var notable = searchResult.notable;
                if (notable !== undefined) {
                    format.somethingToDistinguish = notable.name;
                    format.distinctionType = "type";
                }
                return format;
            });
        };
        this.getMoreInfoForSearchResult = function (searchResult, callback) {
            var freebaseId = freebaseInstance().idInFreebaseURI(
                searchResult.uri
            );
            var options = {
                filter:"(all mid:" + freebaseId + ")",
                output:"(notable:/client/summary description type)",
                key:freebaseInstance().key
            };
            var url = freebaseInstance().SEARCH_URL + "?" + $.param(options);
            $.ajax({
                type:'GET',
                dataType:"jsonp",
                url:url
            }).success(function (result) {
                    result = result.result[0];
                    var descriptions = result.output.description;
                    var descriptionKey = Object.keys(descriptions)[0];
                    var descriptionText = descriptionKey === undefined ?
                        "" :
                        descriptions[descriptionKey][0];
                    callback({
                            conciseSearchResult:searchResult,
                            title:result.name,
                            source:descriptionKey,
                            text:descriptionText,
                            imageUrl:freebaseInstance().thumbnailImageUrlFromFreebaseId(
                                result.mid
                            )
                        }
                    );
                });
        };
        function freebaseInstance(){
            return require("triple_brain.freebase");
        }
    }

    return api;
});