/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.search"
], function ($, SearchService) {
    var api = {};
    api.toFetchOnlyCurrentUserVertices = function(){
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOnlyOwnVerticesAjaxCall
        );
    };
    api.toFetchCurrentUserVerticesAndPublicOnes = function(){
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOwnVerticesAndPublicOnesAjaxCall
        );
    };
    api.toFetchRelations = function(){
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOwnRelationsAjaxCall
        );
    };
    return api;
    function UserMapAutoCompleteProvider(fetchMethod){
        var self = this;
        this.getFetchMethod = function (searchTerm) {
            return fetchMethod(
                searchTerm
            );
        };
        this.formatResults = function(searchResults){
            return $.map(searchResults, function (searchResult) {
                var format = {
                    nonFormattedSearchResult: searchResult,
                    comment:searchResult.comment,
                    label:searchResult.label,
                    value:searchResult.label,
                    source: $.t("vertex.search.user") + " " + searchResult.owner_username,
                    uri:searchResult.uri,
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
                    text: searchResult.nonFormattedSearchResult.comment,
                    imageUrl:""
                }
            );
        };
    }
});