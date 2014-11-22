/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.vertex",
        "triple_brain.edge",
        "triple_brain.group_relation",
        "triple_brain.identification"
    ],
    function ($, Vertex, Edge, GroupRelation, Identification) {
        "use strict";
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
                initRelationsOfVertex(
                    vertexWithId(
                        edge.getSourceVertex().getUri()
                    )
                );
                initRelationsOfVertex(
                    vertexWithId(
                        edge.getDestinationVertex().getUri()
                    )
                );
                updateRelationsIdentification(edge);
            }

            function initRelationsOfVertex(vertex) {
                if(vertex.similarRelations === undefined){
                    vertex.similarRelations = {};
                }
            }

            function updateRelationsIdentification(edge) {
                var sourceVertex = vertexWithId(
                        edge.getSourceVertex().getUri()
                    ),
                    destinationVertex = vertexWithId(
                        edge.getDestinationVertex().getUri()
                    ),
                    edgeIdentifications = edge.getIdentifications();
                if(destinationVertex.isInvolved && !sourceVertex.isInvolved){
                    sourceVertex = vertexWithId(
                        edge.getDestinationVertex().getUri()
                    );
                    destinationVertex = vertexWithId(
                        edge.getSourceVertex().getUri()
                    );
                }
                sourceVertex.isInvolved = true;
                destinationVertex.isInvolved = true;
                $.each(edgeIdentifications, function () {
                    var identification = this,
                        key = identification.getExternalResourceUri(),
                        groupRelation = sourceVertex.similarRelations[key];
                    if (groupRelation === undefined) {
                        groupRelation = GroupRelation.usingIdentification(
                            identification
                        );
                    }
                    groupRelation.addVertex(
                        destinationVertex,
                        edge
                    );
                    sourceVertex.similarRelations[key] = groupRelation;
                });
                if (edgeIdentifications.length === 0) {
                    var key = edge.getUri(),
                        groupRelation = sourceVertex.similarRelations[key];
                    if(undefined === groupRelation) {
                        groupRelation = GroupRelation.usingIdentification(
                            Identification.fromFriendlyResource(
                                edge
                            )
                        );
                    }
                    groupRelation.addVertex(
                        destinationVertex,
                        edge
                    );
                    sourceVertex.similarRelations[key] = groupRelation;
                }
            }

            function vertexWithId(vertexId) {
                var serverFormat = vertices[vertexId];
                if (isGraphElementFacadeBuilt(serverFormat)) {
                    return serverFormat;
                }
                return vertices[vertexId] = Vertex.fromServerFormat(
                    vertices[vertexId]
                );
            }

            function isGraphElementFacadeBuilt(graphElementServerFormat) {
                return graphElementServerFormat["getLabel"] !== undefined;
            }
        };
        return api;
    }
);