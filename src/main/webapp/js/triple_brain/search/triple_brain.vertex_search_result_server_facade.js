/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.graph_element_server_facade"
], function(GraphElementServerFacade){
    var api = {};
    api.fromServerFormat = function(serverFormat){
        return new Object(
            serverFormat
        );
    };
    function Object(serverFormat){
        GraphElementServerFacade.Object.apply(
            this, [serverFormat.graphElement]
        );
        this.getRelationsName = function(){
            return undefined === serverFormat.relationsName ?
                [] :
                serverFormat.relationsName;
        };
        this.isVertex = function(){
            return true;
        };
    }
    return api;
});