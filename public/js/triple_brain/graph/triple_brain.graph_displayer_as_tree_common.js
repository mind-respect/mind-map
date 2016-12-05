/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.vertex",
        "triple_brain.edge",
        "triple_brain.group_relation"
    ],
    function ($, Vertex, Edge, GroupRelation) {
        "use strict";
        var api = {};
        api.setUiTreeInfoToVertices = function (serverGraph, centralVertexUri) {
            return new UiTreeInfoBuilder(
                serverGraph, centralVertexUri
            ).doIt();
        };
        function UiTreeInfoBuilder(serverGraph, centralVertexUri) {
            this.serverGraph = serverGraph;
            this.vertices = serverGraph.vertices;
            this.originalEdges = serverGraph.edges;
            this.centralBubble = this._vertexWithId(centralVertexUri);
            this.edgesFacade = this._arrayOfEdgesHavingThoseRelatedToCenterVertexOnTop();
            this.nonEnhancedEdges = {};
            this.joinIfMoreSimilarRelations = {};
            this.identifiersRepertoire = {};
        }

        UiTreeInfoBuilder.prototype.doIt = function () {
            this.centralBubble.isInvolved = true;
            this._initVertex(
                this.centralBubble
            );
            this._setTreeInfoToVertices();
            this._buildRelationsOfVertices();
            this.serverGraph.edges = this.edgesFacade;
        };

        UiTreeInfoBuilder.prototype._setTreeInfoToVertices = function () {
            this.edgesFacade.forEach(function (edge) {
                    this._updateTripleTreeInfoUsingEdge(
                        edge
                    );
                }.bind(this)
            );
        };

        UiTreeInfoBuilder.prototype._buildRelationsOfVertices = function () {
            $.each(this.serverGraph.vertices, function (key, sourceVertex) {
                sourceVertex.groupRelationRoots = [];
                $.each(sortIdentifiersByNumberOfRelationsDesc(sourceVertex.childrenGroupedByIdentifiers), function (identifierKey, tuplesHavingSameIdentifier) {
                    tuplesHavingSameIdentifier.forEach(function(tuple){
                        console.log(tuple.edge.getLabel());
                    });

                    var groupRelation = GroupRelation.forTuplesAndIdentifier(
                        tuplesHavingSameIdentifier,
                        this.identifiersRepertoire[identifierKey]
                    );
                    var integratedIntoAnotherGroupRelationTree = false;
                    sourceVertex.groupRelationRoots.forEach(function (existingGroupRelationRoot) {
                        if(existingGroupRelationRoot.integrateGroupRelationToTreeIfApplicable(groupRelation)){
                            integratedIntoAnotherGroupRelationTree = true;
                        }
                    });
                    if (!integratedIntoAnotherGroupRelationTree) {
                        sourceVertex.groupRelationRoots.push(
                            groupRelation
                        );
                    }
                }.bind(this));
            }.bind(this));
        };

        UiTreeInfoBuilder.prototype._updateTripleTreeInfoUsingEdge = function (edge) {
            this._initVertex(
                this._vertexWithId(
                    edge.getSourceVertex().getUri()
                )
            );
            this._initVertex(
                this._vertexWithId(
                    edge.getDestinationVertex().getUri()
                )
            );
            this._updateRelationsIdentification(edge);
        };

        UiTreeInfoBuilder.prototype._arrayOfEdgesHavingThoseRelatedToCenterVertexOnTop = function () {
            var edges = [];
            $.each(this.originalEdges, function () {
                edges.push(
                    isGraphElementFacadeBuilt(this) ? this : Edge.fromServerFormat(
                        this
                    )
                );
            });
            edges.sort(function (edge1, edge2) {
                var edge1IsRelated = this._isEdgeRelatedToCenterVertex(edge1),
                    edge2IsRelated = this._isEdgeRelatedToCenterVertex(edge2);
                if (edge1IsRelated === edge2IsRelated) {
                    return 0;
                }
                if (edge1IsRelated) {
                    return -1;
                }
                return 1;
            }.bind(this));
            return edges;
        };

        UiTreeInfoBuilder.prototype._isEdgeRelatedToCenterVertex = function (edge) {
            return edge.getSourceVertex().getUri() === this.centralVertexUri ||
                edge.getDestinationVertex().getUri() === this.centralVertexUri;
        };

        UiTreeInfoBuilder.prototype._initVertex = function (vertex) {
            if (undefined === vertex.childrenGroupedByIdentifiers) {
                vertex.childrenGroupedByIdentifiers = [];
            }
        };

        UiTreeInfoBuilder.prototype._updateRelationsIdentification = function (edge) {
            var sourceVertex = this._vertexWithId(
                edge.getSourceVertex().getUri()
                ),
                destinationVertex = this._vertexWithId(
                    edge.getDestinationVertex().getUri()
                );
            if (!sourceVertex.isInvolved && !destinationVertex.isInvolved) {
                this.nonEnhancedEdges[edge.getUri()] = edge;
                return;
            }
            if (destinationVertex.isInvolved && !sourceVertex.isInvolved) {
                sourceVertex = this._vertexWithId(
                    edge.getDestinationVertex().getUri()
                );
                destinationVertex = this._vertexWithId(
                    edge.getSourceVertex().getUri()
                );
            }
            sourceVertex.isInvolved = true;
            destinationVertex.isInvolved = true;
            var edgeIdentifications = edge.getIdentifiersIncludingSelf();
            var identifiers = sourceVertex.childrenGroupedByIdentifiers;
            edgeIdentifications.forEach(function (identifier) {
                this.identifiersRepertoire[identifier.getExternalResourceUri()] = identifier;
                if (undefined === identifiers[identifier.getExternalResourceUri()]) {
                    identifiers[identifier.getExternalResourceUri()] = [];
                }
                identifiers[identifier.getExternalResourceUri()].push(
                    {
                        vertex: destinationVertex,
                        edge: edge
                    }
                );
            }.bind(this));
            delete this.nonEnhancedEdges[edge.getUri()];
            this._revisitNonEnhancedEdges();
        };

        UiTreeInfoBuilder.prototype._setupGroupRelation = function (identifiers, createIfUndefined) {
            var key = this._getIdentifiersKey(identifiers),
                groupRelation = sourceVertex.similarRelations[key];
            if (groupRelation === undefined && createIfUndefined) {
                groupRelation = GroupRelation.usingIdentification(
                    identifiers
                );
            }
            if (groupRelation === undefined) {
                if (this.joinIfMoreSimilarRelations[key] === undefined) {
                    this.joinIfMoreSimilarRelations[key] = [];
                }
                this.joinIfMoreSimilarRelations[key].push({
                    destinationVertex: destinationVertex,
                    edge: edge
                });
            }
            else {
                groupRelation.addTuple(
                    destinationVertex,
                    edge
                );
                sourceVertex.similarRelations[key] = groupRelation;
                if (this.joinIfMoreSimilarRelations[key] !== undefined) {
                    $.each(this.joinIfMoreSimilarRelations[key], function () {
                        groupRelation.addTuple(
                            this.destinationVertex,
                            this.edge
                        );
                    });
                    this.joinIfMoreSimilarRelations[key] = undefined;
                }
            }
        };


        UiTreeInfoBuilder.prototype._getIdentifiersKey = function (identifiers) {
            var key = "";
            if (Array.isArray(identifiers)) {
                $.each(identifiers, function () {
                    key += this.getExternalResourceUri();
                });
            }
            else {
                key = identifiers.getExternalResourceUri();
            }
            return key;
        };

        UiTreeInfoBuilder.prototype._revisitNonEnhancedEdges = function () {
            $.each(this.nonEnhancedEdges, function (key, edge) {
                this._updateRelationsIdentification(edge);
            }.bind(this));
        };

        UiTreeInfoBuilder.prototype._vertexWithId = function (vertexId) {
            var serverFormat = this.vertices[vertexId];
            if (isGraphElementFacadeBuilt(serverFormat)) {
                return serverFormat;
            }
            return this.vertices[vertexId] = Vertex.fromServerFormat(
                this.vertices[vertexId]
            );
        };

        function isGraphElementFacadeBuilt(graphElementServerFormat) {
            return graphElementServerFormat["getLabel"] !== undefined;
        }

        function sortIdentifiersByNumberOfRelationsDesc(identifiers) {
            var sortedKeys = Object.keys(identifiers).sort(
                function (a, b) {
                    var relationsA = identifiers[a];
                    var relationsB = identifiers[b];
                    if (relationsA.length === relationsB.length) {
                        return 0
                    }
                    if (relationsA.length > relationsB.length) {
                        return -1;
                    }
                    return 1;
                });
            var sortedIdentifiers = {};
            $.each(sortedKeys, function () {
                sortedIdentifiers[this] = identifiers[this];
            });
            return sortedIdentifiers;
        }

        return api;
    });