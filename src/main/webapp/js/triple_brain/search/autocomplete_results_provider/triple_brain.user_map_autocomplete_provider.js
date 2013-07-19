/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.search"
], function ($, SearchService) {
    var api = {};
    api.toFetchOnlyCurrentUserVertices = function(){
        return new UserMapAutoCompleteProvider(true);
    };
    api.toFetchCurrentUserVerticesAndPublicOnes = function(){
        return new UserMapAutoCompleteProvider(false);
    };
    return api;
    function UserMapAutoCompleteProvider(isOnlyForOwnVertices){
        var self = this;
        this.getFetchMethod = function (searchTerm) {
            var fetchMethod = isOnlyForOwnVertices ?
                SearchService.searchForOnlyOwnVerticesAjaxCall :
                SearchService.searchForOwnVerticesAndPublicOnesAjaxCall;
            return fetchMethod(
                searchTerm
            );
        };
        this.formatResults = function(searchResults){
            return $.map(searchResults, function (searchResult) {
                var format = {
                    nonFormattedSearchResult: searchResult,
                    description:searchResult.note,
                    label:searchResult.label,
                    value:searchResult.label,
                    source:"user " + searchResult.owner_username,
                    uri:searchResult.id,
                    provider:self
                };
                format.somethingToDistinguish = searchResult.relations_name.filter(
                    function (relationName) {
                        return relationName !== "";
                    }
                ).join(", ");
                format.distinctionType = "relations";
                return format;
            });
        };
        this.getMoreInfoForSearchResult = function (searchResult, callback) {
            callback({
                    conciseSearchResult:searchResult,
                    title:searchResult.label,
                    text: searchResult.nonFormattedSearchResult.note,
                    imageUrl:""
                }
            );
        };
    }
});