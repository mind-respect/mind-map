/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
], function(){
    var api = {};
    api.get = function(searchResult){
        return searchResult.edge === undefined ?
            VertexSearchResultServerFacade.fromServerFormat(searchResult) :
            RelationSearchResultServerFacade.fromServerFormat(searchResult);
    };
    return api;
});