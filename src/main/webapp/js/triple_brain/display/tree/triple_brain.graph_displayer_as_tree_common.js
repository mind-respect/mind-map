/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
],
    function ($) {
        var api = {};
        api.defineChildrenInVertices = function (serverGraph, centralVertexUri) {
            var sourceId;
            var destinationId;
            var vertices = serverGraph.vertices;
            var edges = serverGraph.edges;
            initChildrenOfVertex(
                vertexWithId(centralVertexUri)
            );
            $.each(edges, function () {
                    updateVerticesChildrenWithEdge(this);
                }
            );
            function updateVerticesChildrenWithEdge(edge) {
                sourceId = edge.source_vertex_id;
                destinationId = edge.destination_vertex_id;
                applyToBoth([
                    initVertexInTreeInfoIfNecessary
                ]);
//                var parentId,
//                    childId;
//                if (isCentralVertex(destinationId)) {
//                    parentId = destinationId;
//                    childId = sourceId
//                } else {
//                    parentId = sourceId;
//                    childId = destinationId;
//                }
                setNeighbors(sourceId, destinationId, edge);
            }

            function initVertexInTreeInfoIfNecessary(vertexId) {
                var vertex = vertices[vertexId];
                if (vertex.neighbors === undefined) {
                    initChildrenOfVertex(vertex);
                }
            }

            function initChildrenOfVertex(vertex) {
                vertex.neighbors = [];
            }

            function isCentralVertex(vertexId) {
                return vertexId === centralVertexUri;
            }

            function setNeighbors(vertexId, childrenId, edge) {
                vertices[vertexId].neighbors.push({
                    vertexUri:childrenId,
                    edge:edge
                });
                vertices[childrenId].neighbors.push({
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
                return vertices[vertexId]
            }
        }

        return api;
    }
);