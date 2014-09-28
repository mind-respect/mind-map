/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.relative_tree_vertex",
    "triple_brain.bubble",
    "triple_brain.graph_element_ui",
    "triple_brain.vertex_ui",
    "triple_brain.event_bus",
    "triple_brain.graph_displayer"
], function (RelativeTreeVertex, Bubble, GraphElementUi, VertexUi, EventBus, GraphDisplayer) {
    "use strict";
    var api = {};
    api.withHtml = function (html) {
        return new Self(html);
    };
    api.getWhenEmptyLabel = function(){
        return "suggestion";
    };
    function Self(html) {
        this.html = html;
        this.bubble = Bubble.withHtmlFacade(this);
        RelativeTreeVertex.Object.apply(this);
        this.init(html);
    }
    Self.prototype = new RelativeTreeVertex.Object;
    Self.prototype.getGraphElementType = function () {
        return GraphElementUi.Types.VertexSuggestion;
    };
    Self.prototype.getServerFormat = function () {
        return this._getServerFacade().getServerFormat();
    };
    Self.prototype._getServerFacade = function(){
        return this.html.data("suggestionFacade");
    };
    Self.prototype.getParentVertex = function () {
        return this.bubble.getParentVertex();
    };
    Self.prototype.integrate = function (newVertexUri) {
        RelativeTreeVertex.removeVertexFromCache(
            this.getUri(),
            this.getId()
        );
        VertexUi.removeVertexFromCache(
            this.getUri(),
            this.getId()
        );
        this.html.data(
            "uri",
            newVertexUri
        ).data(
            "originalServerObject",
            {isLeftOriented : this.isToTheLeft()}
        ).removeClass(
            "suggestion"
        );
        this.getLabel().attr(
            "placeholder", RelativeTreeVertex.getWhenEmptyLabel()
        );
        this.readjustLabelWidth();
        var vertex = new RelativeTreeVertex.Object().init(
            this.html
        );
        RelativeTreeVertex.initCache(
            vertex
        );
        VertexUi.initCache(
            vertex
        );
        vertex.rebuildMenuButtons();
        EventBus.publish(
            '/event/ui/html/vertex/created/',
            vertex
        );
        return vertex;
    };
    Self.prototype.getRelationWithParent = function () {
        return GraphDisplayer.getRelationSuggestionSelector().withHtml(
            this.getRelationWithParentHtml()
        );
    };
    return api;
});