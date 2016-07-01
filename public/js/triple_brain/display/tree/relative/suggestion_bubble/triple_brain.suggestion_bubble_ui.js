/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.relative_tree_vertex",
    "triple_brain.graph_element_ui",
    "triple_brain.vertex_ui",
    "triple_brain.vertex",
    "triple_brain.event_bus",
    "triple_brain.selection_handler",
    "triple_brain.vertex_html_builder",
    "triple_brain.graph_displayer",
    "triple_brain.graph_service",
    "triple_brain.sub_graph",
    "triple_brain.triple",
    "triple_brain.suggestion",
    "jquery.i18next"
], function ($, RelativeTreeVertex, GraphElementUi, VertexUi, Vertex, EventBus, SelectionHandler, VertexHtmlBuilder, GraphDisplayer, GraphService, SubGraph, Triple, Suggestion) {
    "use strict";
    var api = {};
    RelativeTreeVertex.buildCommonConstructors(api);
    api.createFromHtml = function (html) {
        var suggestion = new api.Self(
            html
        );
        api.initCache(suggestion);
        return suggestion;
    };
    api.getWhenEmptyLabel = function () {
        return $.t("suggestion.when-empty");
    };
    api.Self = function (html) {
        this.html = html;
        this.integrationDeferrer = $.Deferred();
        RelativeTreeVertex.Object.apply(this);
        this.init(html);
    };
    api.Self.prototype = new RelativeTreeVertex.Object();
    api.Self.prototype.getGraphElementType = function () {
        return GraphElementUi.Types.VertexSuggestion;
    };

    api.Self.prototype.integrateUsingNewVertexAndEdgeUri = function (newVertexUri, newEdgeUri) {
        var vertexUi = this.integrate(newVertexUri);
        this.getRelationWithUiParent().integrate(
            newEdgeUri,
            vertexUi
        );
        return vertexUi;
    };

    api.Self.prototype.whenItIntegrates = function () {
        return this.integrationDeferrer.promise();
    };

    api.Self.prototype.getModel = function () {
        return this.getSuggestion().getOrigin().isFromComparison() ?
            this.model.getType() : this.getSuggestion();
    };

    api.Self.prototype.getSuggestion = function () {
        return this.model;
    };

    api.Self.prototype.integrate = function (newVertexUri) {
        api.removeFromCache(
            this.getUri(),
            this.getId()
        );
        var vertex = Vertex.withUri(
            newVertexUri
        );
        vertex.setLabel(
            this.text()
        );
        if (this.getSuggestion().getOrigin().isFromComparison()) {
            vertex.addGenericIdentification(
                this.getSuggestion().getType()
            );
        } else {
            vertex.addType(
                this.getSuggestion().getSameAs()
            );
            if (this.getSuggestion().hasType()) {
                vertex.addType(
                    this.getSuggestion().getType()
                );
            }
        }
        vertex.isLeftOriented = this.isToTheLeft();
        this.html.data(
            "uri",
            newVertexUri
        ).removeClass(
            "suggestion"
        );
        this.getLabel().attr(
            "placeholder", RelativeTreeVertex.getWhenEmptyLabel()
        );
        var vertexUi = RelativeTreeVertex.createFromHtml(
            this.html
        );
        vertexUi.setModel(
            vertex
        );
        vertexUi.rebuildMenuButtons();
        vertexUi.setComparedWith(
            this.getComparedWith()
        );
        vertexUi.quitCompareAddOrRemoveMode();
        vertexUi.refreshComparison();
        SelectionHandler.setToSingleGraphElement(vertexUi);
        EventBus.publish(
            '/event/ui/html/vertex/created/',
            vertexUi
        );
        VertexHtmlBuilder.completeBuild(vertexUi);
        this.integrationDeferrer.resolve(vertexUi);
        return vertexUi;
    };
    api.Self.prototype.addChildTree = function () {
        var deferred = $.Deferred();
        var uriToFetch = this.getModel().getExternalResourceUri();
        var self = this;
        var parentEdgeUri = this.getParentBubble().getFirstIdentificationToAGraphElement().getExternalResourceUri();
        GraphService.getForCentralVertexUri(
            uriToFetch,
            function (serverGraph) {
                var subGraph = SubGraph.fromServerFormat(serverGraph);
                var centerVertex = subGraph.getVertexWithUri(
                    self.getModel().getExternalResourceUri()
                );
                var suggestions = [];
                subGraph.visitEdgesRelatedToVertex(centerVertex, function (edge) {
                    if(edge.getUri() === parentEdgeUri){
                        return;
                    }
                    suggestions.push(
                        Suggestion.fromTriple(
                            Triple.fromEdgeAndSourceAndDestinationVertex(
                                edge,
                                centerVertex,
                                edge.getOtherVertex(centerVertex)
                            )
                        )
                    );
                });
                GraphDisplayer.addSuggestionsToVertex(
                    suggestions,
                    self
                );
                deferred.resolve();
            }
        );
        return deferred.promise();
    };
    return api;
});