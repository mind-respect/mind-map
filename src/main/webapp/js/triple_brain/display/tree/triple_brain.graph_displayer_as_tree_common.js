/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "jquery",
    "triple_brain.vertex_server_facade",
    "triple_brain.edge_server_facade"
],
    function (require, $, VertexServerFacade, EdgeServerFacade) {
        var api = {};
        api.enhancedVerticesInfo = function (serverGraph, centralVertexUri) {
            var sourceId,
                destinationId,
                vertices = serverGraph.vertices,
                originalEdges = serverGraph.edges,
                edgesFacade = [];
            initChildrenOfVertex(
                vertexWithId(centralVertexUri)
            );
            $.each(originalEdges, function () {
                    var edgeFacade = isGraphElementFacadeBuilt(this) ? this : EdgeServerFacade.fromServerFormat(
                        this
                    );
                    edgesFacade.push(
                        edgeFacade
                    );
                    updateVerticesChildrenWithEdge(
                        edgeFacade
                    );
                }
            );
            serverGraph.edges = edgesFacade;
            function updateVerticesChildrenWithEdge(edge) {
                sourceId = edge.getSourceVertex().getUri();
                destinationId = edge.getDestinationVertex().getUri();
                applyToBoth([
                    initVertexInTreeInfoIfNecessary
                ]);
                setNeighbors(sourceId, destinationId, edge);
            }

            function initVertexInTreeInfoIfNecessary(vertexId) {
                var vertex = vertexWithId(vertexId);
                if (vertex.neighbors === undefined) {
                    initChildrenOfVertex(vertex);
                }
            }

            function initChildrenOfVertex(vertex) {
                vertex.neighbors = [];
            }

            function setNeighbors(vertexId, childrenId, edge) {
                vertexWithId(vertexId).neighbors.push({
                    vertexUri:childrenId,
                    edge:edge
                });
                vertexWithId(childrenId).neighbors.push({
                    vertexUri:vertexId,
                    edge:edge
                });
            }

            function applyToBoth(functions) {
                $.each(functions, function () {
                    var func = this;
                    func(sourceId);
                    func(destinationId);
                });
            }
            function vertexWithId(vertexId) {
                var serverFormat = vertices[vertexId];
                if(isGraphElementFacadeBuilt(serverFormat)){
                    return serverFormat;
                }
                return vertices[vertexId] = getVertexServerFacade().fromServerFormat(
                    vertices[vertexId]
                );
            }
            function isGraphElementFacadeBuilt(graphElementServerFormat){
                return graphElementServerFormat["getLabel"] !== undefined;
            }
        };

        return api;

        function getVertexServerFacade(){
            if(VertexServerFacade === undefined){
                VertexServerFacade = require("triple_brain.vertex_server_facade")
            }
            return VertexServerFacade;
        }
    }
);