/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_element_controller",
    "triple_brain.suggestion_service",
    "triple_brain.graph_service",
    "triple_brain.sub_graph",
    "triple_brain.suggestion",
    "triple_brain.triple",
    "triple_brain.graph_displayer"
], function ($, GraphElementController, SuggestionService, GraphService, SubGraph, Suggestion, Triple, GraphDisplayer) {
    "use strict";
    var api = {};

    function SuggestionVertexController(suggestionsUi) {
        this.suggestionsUi = suggestionsUi;
        GraphElementController.Self.prototype.init.call(
            this,
            this.suggestionsUi
        );
    }

    SuggestionVertexController.prototype = new GraphElementController.Self();

    SuggestionVertexController.prototype.acceptCanDo = function () {
        return this.isSingleAndOwned();
    };

    SuggestionVertexController.prototype.cutCanDo = function () {
        return false;
    };

    SuggestionVertexController.prototype.accept = function () {
        var deferred = $.Deferred();
        var self = this;
        var suggestionVertex = this.getUi();
        var parentSuggestionVertex = suggestionVertex.getParentSuggestionVertex();
        var hasParentSuggestionVertex = !parentSuggestionVertex.isSameBubble(
            suggestionVertex
        );
        if (hasParentSuggestionVertex) {
            return parentSuggestionVertex.getController().accept().then(
                acceptCurrent
            );
        }
        return acceptCurrent();
        function acceptCurrent() {
            return SuggestionService.accept(
                self.getUi()
            ).then(function (xhr) {
                var newVertexUi = self.getUi().integrateUsingNewVertexAndEdgeUri(
                    xhr.vertex_uri,
                    xhr.edge_uri
                );
                return deferred.resolve(
                    newVertexUi
                );
            });
        }
    };

    SuggestionVertexController.prototype.addChildCanDo = function () {
        return this.isSingleAndOwned();
    };

    SuggestionVertexController.prototype.addChild = function () {
        this.accept().then(function (newVertex) {
            newVertex.getController().addChild();
        });
    };
    SuggestionVertexController.prototype.centerCanDo = function () {
        return false;
    };
    SuggestionVertexController.prototype.expand = function () {
        var deferred = $.Deferred();
        if (this.getUi().isCollapsed()) {
            this.getUi().expand();
            return deferred.resolve();
        }
        this.getUi().hideHiddenRelationsContainer();
        var uriToFetch = this.getUi().getModel().getExternalResourceUri();
        var suggestionUi = this.getUi();
        var parentEdgeUri = this.getUi().getParentBubble().getFirstIdentificationToAGraphElement().getExternalResourceUri();
        GraphService.getForCentralBubbleUri(
            uriToFetch,
            function (serverGraph) {
                var subGraph = SubGraph.fromServerFormat(serverGraph);
                var centerVertex = subGraph.getVertexWithUri(
                    suggestionUi.getModel().getExternalResourceUri()
                );
                subGraph.visitEdgesRelatedToVertex(centerVertex, function (edge) {
                    if (edge.getUri() === parentEdgeUri) {
                        return;
                    }
                    var destinationVertex = edge.getOtherVertex(centerVertex);
                    destinationVertex = subGraph.getVertexWithUri(
                        destinationVertex.getUri()
                    );
                    var triple = GraphDisplayer.addSuggestionToVertex(
                        Suggestion.fromTriple(
                            Triple.fromEdgeAndSourceAndDestinationVertex(
                                edge,
                                centerVertex,
                                destinationVertex
                            )
                        ),
                        suggestionUi
                    );
                    triple.edge().setComparedWith(
                        edge
                    );
                    triple.destinationVertex().setText(
                        destinationVertex.getLabel()
                    );
                    triple.destinationVertex().setComparedWith(
                        destinationVertex
                    );
                    if (destinationVertex.getNumberOfConnectedEdges() > 1) {
                        triple.destinationVertex().buildHiddenNeighborPropertiesIndicator();
                    }
                });
                deferred.resolve();
            }
        );
        return deferred.promise();
    };
    api.Self = SuggestionVertexController;
    return api;
});