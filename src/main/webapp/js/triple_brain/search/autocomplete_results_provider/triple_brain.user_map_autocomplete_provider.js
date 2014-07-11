/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.search",
    "triple_brain.identification_context",
    "triple_brain.search_result_facade_factory",
    "triple_brain.id_uri"
], function ($, SearchService, IdentificationContext, SearchResultFacadeFactory, IdUri) {
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
            searchResults = $.map(searchResults, function (searchResult) {
                var searchResultFacade = SearchResultFacadeFactory.get(
                    searchResult
                );
                var format = {
                    nonFormattedSearchResult: searchResultFacade,
                    comment:searchResultFacade.getComment(),
                    label:searchResultFacade.getLabel(),
                    value:searchResultFacade.getLabel(),
                    source: $.t("vertex.search.user") + " " + IdUri.usernameFromUri(searchResultFacade.getUri()),
                    uri:searchResultFacade.getUri(),
                    provider:self
                };
                if(searchResultFacade.isVertex()){
                    format.somethingToDistinguish = IdentificationContext.formatRelationsName(
                        IdentificationContext.removedEmptyAndDuplicateRelationsName(
                            searchResultFacade.getRelationsName()
                        )
                    );
                    format.distinctionType = "relations";
                }
                return format;
            });
            return filteredSearchResults();
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
            var originalSearchResult = searchResult.nonFormattedSearchResult;
            IdentificationContext.buildWithoutBubbleLinks(
                originalSearchResult,
                function(context){
                    var moreInfo = context.append(
                        originalSearchResult.context,
                        $("<div>").append(originalSearchResult.comment)
                    );
                    callback({
                            conciseSearchResult:searchResult,
                            title:searchResult.label,
                            text: moreInfo,
                            imageUrl:""
                        }
                    );
                }
            );
        };
        function removeGraphElementToIgnoreFromResults(searchResults){
            var filteredResults = [];
            $.each(searchResults, function(){
                var searchResult = this;
                var searchResultFacade = this.nonFormattedSearchResult;
                if(searchResultFacade.getUri() !== graphElementToIgnore.getUri()){
                    filteredResults.push(searchResult);
                }
            });
            return filteredResults;
        }

        function keepOneResultForResultsThatMeanTheSame(searchResults){
            var nonDuplicatedResults = [];
            $.each(searchResults, function(){
                var searchResult = this;
                var serverFormatFacade = searchResult.nonFormattedSearchResult;
                if(serverFormatFacade.getUri() === graphElementToIgnore.getUri()){
                    return;
                }
                var toKeep = true;
                $.each(serverFormatFacade.getIdentifications(), function(){
                    var identification = this;
                    $.each(searchResults, function(){
                        var otherSearchResult = this;
                        var otherResultServerFormatFacade = otherSearchResult.nonFormattedSearchResult;
                        if(otherResultServerFormatFacade.getUri() === otherResultServerFormatFacade.getUri()){
                            return;
                        }
                        if(identification.getUri() === otherResultServerFormatFacade.getUri()){
                            toKeep = false;
                            return breakLoop();
                        }
                        $.each(otherResultServerFormatFacade.getIdentifications(), function(){
                            var otherSearchResultIdentification = this;
                            if(otherSearchResultIdentification.getUri() === identification.getUri()){
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