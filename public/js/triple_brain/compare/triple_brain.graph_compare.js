/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_displayer",
    "triple_brain.suggestion",
    "diff_match_patch"
], function (GraphDisplayer, Suggestion) {
    "use strict";
    var api = {};
    api.withOtherGraph = function (otherGraph) {
        return new GraphCompare(
            otherGraph
        );
    };

    function GraphCompare(otherGraph) {
        this.otherGraph = otherGraph;
    }

    GraphCompare.prototype.show = function () {
        this._showForVertices();
        this._showForEdges();
    };

    GraphCompare.prototype._showForVertices = function () {
        var self = this;
        GraphDisplayer.getVertexSelector().visitAllVertices(function (vertexUi) {
            var identification = vertexUi.getFirstIdentificationToAGraphElement();
            if (!identification) {
                return;
            }
            var related = self.otherGraph.getVertexRelatedToIdentification(
                identification
            );
            if (!related) {
                return;
            }
            self.compareLabel(vertexUi, related);
            self.otherGraph.visitEdgesRelatedToVertex(related, function (edge) {
                var isConnectedToEdge = false;
                vertexUi.visitConnectedEdges(function (edgeUi) {
                    var edgeIdentification = edgeUi.getFirstIdentificationToAGraphElement();
                    if (!edgeIdentification) {
                        return;
                    }
                    if (edge.isRelatedToIdentification(edgeIdentification)) {
                        isConnectedToEdge = true;
                        edge.addGenericIdentification(
                            edgeIdentification
                        );
                        return false;
                    }
                });
                if (!isConnectedToEdge) {
                    var vertexToAdd = self.otherGraph.getVertexWithUri(
                        edge.getOtherVertex(related).getUri()
                    );
                    vertexToAdd.addGenericIdentification(
                        identification
                    );
                    var tripleUi = GraphDisplayer.addEdgeAndVertexSuggestionToSourceVertex(
                        Suggestion.fromFriendlyResource(edge),
                        Suggestion.fromFriendlyResource(vertexToAdd),
                        vertexUi
                    );
                    var newEdge = tripleUi.edge();
                    self.compareLabel(newEdge, edge);
                    var newVertex = tripleUi.destinationVertex();
                    newEdge.setAsComparisonSuggestion();
                    newVertex.setAsComparisonSuggestion();
                    newVertex.setText(
                        vertexToAdd.getLabel()
                    );
                    self.compareLabel(newVertex, vertexToAdd);
                }
            });
        });
    };

    GraphCompare.prototype._showForEdges = function () {
        var self = this;
        GraphDisplayer.getEdgeSelector().visitAllEdges(function (edgeUi) {
            var identification = edgeUi.getFirstIdentificationToAGraphElement();
            if (!identification) {
                return;
            }
            var related = self.otherGraph.getEdgeRelatedToIdentification(
                identification
            );
            if (!related) {
                return;
            }
            self.compareLabel(edgeUi, related);
        });
    };
    GraphCompare.prototype.compareLabel = function (originalUi, compared) {
        originalUi.setComparedWith(
            compared
        );
        originalUi.refreshComparison();
    };

    return api;
})
;