/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.id_uri",
    "triple_brain.event_bus",
    "triple_brain.graph_displayer",
    "triple_brain.vertex_server_facade",
    "triple_brain.edge_server_facade"
],
    function (IdUriUtils, EventBus, GraphDisplayer, VertexServerFacade, EdgeServerFacade) {
        var api = {};
        api.createUsingServerTriple = function (sourceVertex, tripleJson) {
            api.createIntoSourceBubble(
                sourceVertex,
                tripleJson
            );
        };
        api.createIntoSourceBubble = function (sourceBubble, tripleJson) {
            var destinationVertex = GraphDisplayer.addVertex(
                VertexServerFacade.fromServerFormat(tripleJson.end_vertex),
                sourceBubble
            );
            var parentVertex = sourceBubble.isGroupRelation() ?
                sourceBubble.getParentVertex() : sourceBubble;

            var edge = GraphDisplayer.addEdge(
                EdgeServerFacade.fromServerFormat(tripleJson.edge),
                parentVertex,
                destinationVertex
            );
            return new Triple(
                parentVertex,
                edge,
                destinationVertex
            );
        };

        function Triple(sourceVertex, edge, destinationVertex) {
            this.sourceVertex = function(){
                return sourceVertex;
            };
            this.edge = function(){
                return edge;
            };
            this.destinationVertex = function(){
                return destinationVertex;
            };
            this.serverFormat = function(){
                return {

                };
            };
        }
        return api;
    }
);