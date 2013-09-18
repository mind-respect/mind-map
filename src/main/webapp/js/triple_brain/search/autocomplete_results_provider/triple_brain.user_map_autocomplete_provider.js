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
            SearchService.searchForOnlyOwnVerticesAjaxCall,
            false,
            undefined
        );
    };
    api.toFetchOnlyCurrentUserVerticesExcept = function(vertexToIgnore){
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOnlyOwnVerticesAjaxCall,
            false,
            vertexToIgnore
        );
    };
    api.toFetchCurrentUserVerticesAndPublicOnesForIdentification = function(vertexToIdentify){
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOwnVerticesAndPublicOnesAjaxCall,
            true,
            vertexToIdentify
        );
    };
    api.toFetchRelationsForIdentification = function(edgeToIdentify){
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOwnRelationsAjaxCall,
            true,
            edgeToIdentify
        );
    };
    return api;
    function UserMapAutoCompleteProvider(fetchMethod, isForIdentification, graphElementToIgnore){
        var self = this;
        this.getFetchMethod = function (searchTerm) {
            return fetchMethod(
                searchTerm
            );
        };
        this.formatResults = function(searchResults){
            var searchResults = filteredSearchResults();
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
            function filteredSearchResults(){
                if(isForIdentification){
                    return keepOneResultForResultsThatMeanTheSame(
                        searchResults
                    );
                }else if(graphElementToIgnore !== undefined){
                    return removeGraphElementToIgnoreFromResults(
                        searchResults
                    );
                }else{
                    return searchResults;
                }
            }
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

        function removeGraphElementToIgnoreFromResults(searchResults){
            var filteredResults = [];
            $.each(searchResults, function(){
                var searchResult = this;
                if(searchResult.uri !== graphElementToIgnore.getUri()){
                    filteredResults.push(searchResult);
                }
            });
            return filteredResults;
        }

        function keepOneResultForResultsThatMeanTheSame(searchResults){
            var nonDuplicatedResults = [];
            $.each(searchResults, function(){
                var searchResult = this;
                if(searchResult.uri === graphElementToIgnore.getUri()){
                    return;
                }
                var toKeep = true;
                $.each(searchResult.identifications, function(){
                    var identification = this + "";
                    $.each(searchResults, function(){
                        var otherSearchResult = this;
                        if(identification === otherSearchResult.uri){
                            toKeep = false;
                            return breakLoop();
                        }
                        $.each(otherSearchResult.identifications, function(){
                            var otherSearchResultIdentification = this + "";
                            if(otherSearchResultIdentification === identification){
                                toKeep = false;
                                return breakLoop();
                            }
                        });
                        if(!toKeep){
                            return breakLoop();
                        }
                    });
                    if(!toKeep){
                        return breakLoop();
                    }
                });
                if(toKeep){
                    nonDuplicatedResults.push(
                        searchResult
                    );
                }
            });
            return nonDuplicatedResults;
            function breakLoop(){
                return false;
            }
        }
    }
});