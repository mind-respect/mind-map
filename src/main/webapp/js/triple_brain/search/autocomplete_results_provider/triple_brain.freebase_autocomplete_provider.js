/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "jquery",
    "triple_brain.freebase",
    "triple_brain.user"
], function (require, $, Freebase, User) {
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
                key:freebaseInstance().key,
                lang:getUserLocalesFreebaseFormatted()
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
                key:freebaseInstance().key,
                lang:getUserLocalesFreebaseFormatted()
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
                    var descriptionText = "";
                    if(descriptionKey !== undefined){
                        descriptionText = descriptions[descriptionKey][0];
                        if(descriptionText instanceof Object){
                            descriptionText = descriptionText.value;
                        }
                    }
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
        function getUserLocalesFreebaseFormatted(){
            var formattedLocales = "";
            var preferredLocales = User.authenticatedUserInCache().preferred_locales;
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
                        formattedLocales += freebaseAllowedLocale + ",";
                        return -1;
                    }
                });
            });
            return removeLastCommaOfFormattedLocales();
            function removeLastCommaOfFormattedLocales(){
                return formattedLocales.substring(0, formattedLocales.length -1);
            }
        }
    }

    return api;
});