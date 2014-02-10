/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.vertex_search_result_server_facade",
    "triple_brain.relation_search_result_server_facade"
], function(VertexSearchResultServerFacade, RelationSearchResultServerFacade){
    var api = {};
    api.get = function(searchResult){
        return searchResult.edge === undefined ?
            VertexSearchResultServerFacade.fromServerFormat(searchResult) :
            RelationSearchResultServerFacade.fromServerFormat(searchResult);
    };
    return api;
});