/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "require",
        "jquery",
        "triple_brain.vertex",
        "triple_brain.edge",
        "triple_brain.group_relation"
    ],
    function (require, $, Vertex, Edge, GroupRelation) {
        var api = {};
        api.enhancedVerticesInfo = function (serverGraph, centralVertexUri) {
            var vertices = serverGraph.vertices,
                originalEdges = serverGraph.edges,
                edgesFacade = [],
                centralVertex = vertexWithId(centralVertexUri);
            centralVertex.isInvolved = true;
            initRelationsOfVertex(
                centralVertex
            );

            $.each(originalEdges, function () {
                    var edgeFacade = isGraphElementFacadeBuilt(this) ? this : Edge.fromServerFormat(
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
                initRelationsOfVertex(vertexWithId(edge.getSourceVertex().getUri()));
                initRelationsOfVertex(vertexWithId(edge.getDestinationVertex().getUri()));
                updateRelationsIdentification(edge);
            }

            function initRelationsOfVertex(vertex) {
                if(vertex.similarRelations === undefined){
                    vertex.similarRelations = {};
                }
            }

            function updateRelationsIdentification(edge) {
                var sourceVertex = vertexWithId(edge.getSourceVertex().getUri()),
                    destinationVertex = vertexWithId(edge.getDestinationVertex().getUri()),
                    edgeIdentifications = edge.getIdentifications();
                if(destinationVertex.isInvolved && !sourceVertex.isInvolved){
                    sourceVertex = vertexWithId(edge.getDestinationVertex().getUri());
                    destinationVertex = vertexWithId(edge.getSourceVertex().getUri());
                }
                sourceVertex.isInvolved = true;
                destinationVertex.isInvolved = true;
                $.each(edgeIdentifications, function () {
                    var identification = this;
                    if (sourceVertex.similarRelations[identification.getUri()] === undefined) {
                        sourceVertex.similarRelations[identification.getUri()] = GroupRelation.usingIdentification(
                            identification
                        );
                    }
                    sourceVertex.similarRelations[identification.getUri()].addVertex(
                        destinationVertex,
                        edge
                    );
                });
                if (edgeIdentifications.length === 0) {
                    var groupedIdentification = GroupRelation.withoutAnIdentification();
                    groupedIdentification.addVertex(
                        destinationVertex,
                        edge
                    );
                    sourceVertex.similarRelations[edge.getUri()] = groupedIdentification;
                }
            }

            function vertexWithId(vertexId) {
                var serverFormat = vertices[vertexId];
                if (isGraphElementFacadeBuilt(serverFormat)) {
                    return serverFormat;
                }
                return vertices[vertexId] = getVertexServerFacade().fromServerFormat(
                    vertices[vertexId]
                );
            }

            function isGraphElementFacadeBuilt(graphElementServerFormat) {
                return graphElementServerFormat["getLabel"] !== undefined;
            }
        };

        return api;

        function getVertexServerFacade() {
            if (Vertex === undefined) {
                Vertex = require("triple_brain.vertex")
            }
            return Vertex;
        }
    }
);