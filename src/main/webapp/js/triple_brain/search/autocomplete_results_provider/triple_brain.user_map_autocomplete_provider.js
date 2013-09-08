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
            var nonDuplicatedSearchResults = keepOneResultForResultsThatMeanTheSame(
                searchResults
            );
            return $.map(nonDuplicatedSearchResults, function (searchResult) {
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

        function keepOneResultForResultsThatMeanTheSame(searchResults){
            var nonDuplicatedResults = [];
            $.each(searchResults, function(){
                var searchResult = this;
                var toKeep = true;
                $.each(searchResult.identifications, function(){
                    var identification = this + "";
                    $.each(searchResults, function(){
                        var otherSearchResult = this;
                        if(identification === otherSearchResult.uri){
                            toKeep = false;
                            //break the loop
                            return false;
                        }
                        $.each(otherSearchResult.identifications, function(){
                            var otherSearchResultIdentification = this + "";
                            if(otherSearchResultIdentification === identification){
                                toKeep = false;
                                return false;
                            }
                        });
                        if(!toKeep){
                            //break the loop
                            return false;
                        }
                    });
                    if(!toKeep){
                        //break the loop
                        return false;
                    }
                });
                if(toKeep){
                    nonDuplicatedResults.push(
                        searchResult
                    );
                }
            });
            return nonDuplicatedResults;
        }
    }
});