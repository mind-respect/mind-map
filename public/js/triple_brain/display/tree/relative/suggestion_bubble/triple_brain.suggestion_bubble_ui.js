/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.relative_tree_vertex",
    "triple_brain.graph_element_ui",
    "triple_brain.vertex_ui",
    "triple_brain.event_bus",
    "triple_brain.selection_handler",
    "triple_brain.vertex_html_builder",
    "triple_brain.graph_element",
    "jquery.i18next"
], function ($, RelativeTreeVertex, GraphElementUi, VertexUi, EventBus, SelectionHandler, VertexHtmlBuilder, GraphElement) {
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
        return this.model.getType();
    };

    api.Self.prototype.getSuggestion = function () {
        return this.model;
    };

    api.Self.prototype.integrate = function (newVertexUri) {
        api.removeFromCache(
            this.getUri(),
            this.getId()
        );
        var originalServerObject = GraphElement.fromSuggestionAndElementUri(
            this.getSuggestion(),
            newVertexUri
        );
        originalServerObject.isLeftOriented = this.isToTheLeft();
        this.html.data(
            "uri",
            newVertexUri
        ).removeClass(
            "suggestion"
        ).removeClass(
            "compare-add"
        ).removeClass(
            "compare-remove"
        );
        this.getLabel().attr(
            "placeholder", RelativeTreeVertex.getWhenEmptyLabel()
        );
        var vertex = RelativeTreeVertex.createFromHtml(
            this.html
        );
        vertex.setModel(
            originalServerObject
        );
        vertex.rebuildMenuButtons();
        vertex.setComparedWith(
            this.getComparedWith()
        );
        vertex.refreshComparison();
        SelectionHandler.setToSingleGraphElement(vertex);
        EventBus.publish(
            '/event/ui/html/vertex/created/',
            vertex
        );
        VertexHtmlBuilder.completeBuild(vertex);
        this.integrationDeferrer.resolve(vertex);
        return vertex;
    };
    return api;
});