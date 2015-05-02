/*
 * Copyright Vincent Blouin under the GPL License version 3
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