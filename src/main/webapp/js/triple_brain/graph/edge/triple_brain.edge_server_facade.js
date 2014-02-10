/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.graph_element_server_facade",
    "triple_brain.vertex_server_facade"
],function(GraphElementServerFacade, VertexServerFacade){
    var api = {};
    api.fromServerFormat = function(serverFormat){
        return new Object(serverFormat);
    };
    return api;
    function Object(serverFormat){
        var sourceVertex = getVertexServerFacade().fromServerFormat(
            serverFormat.sourceVertex
        );
        var destinationVertex = getVertexServerFacade().fromServerFormat(
            serverFormat.destinationVertex
        );
        GraphElementServerFacade.Object.apply(
            this, [serverFormat.graphElement]
        );
        this.getSourceVertex = function(){
            return sourceVertex;
        };
        this.getDestinationVertex = function(){
            return destinationVertex;
        };
    }
    function getVertexServerFacade(){
        if(undefined === VertexServerFacade){
            VertexServerFacade = require("triple_brain.vertex_server_facade");
        }
        return VertexServerFacade;
    }
});