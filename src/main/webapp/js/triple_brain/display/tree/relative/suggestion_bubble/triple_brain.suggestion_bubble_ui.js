/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.relative_tree_vertex",
    "triple_brain.graph_element_ui",
    "triple_brain.vertex_ui",
    "triple_brain.event_bus"
], function (RelativeTreeVertex, GraphElementUi, VertexUi, EventBus) {
    "use strict";
    var api = {};
    RelativeTreeVertex.buildCommonConstructors(api);
    api.createFromHtml = function(html){
        var suggestion = new api.Self(
            html
        );
        api.initCache(suggestion);
        return suggestion;
    };
    api.getWhenEmptyLabel = function(){
        return "suggestion";
    };
    api.Self = function(html) {
        this.html = html;
        RelativeTreeVertex.Object.apply(this);
        this.init(html);
    };
    api.Self.prototype = new RelativeTreeVertex.Object;
    api.Self.prototype.getGraphElementType = function () {
        return GraphElementUi.Types.VertexSuggestion;
    };
    api.Self.prototype.getServerFormat = function () {
        return this._getServerFacade().getServerFormat();
    };
    api.Self.prototype._getServerFacade = function(){
        return this.html.data("suggestionFacade");
    };

    api.Self.prototype.integrateUsingNewVertexAndEdgeUri = function(newVertexUri, newEdgeUri){
        var vertexUi = this.integrate(newVertexUri);
        this.getRelationWithUiParent().integrate(
            newEdgeUri,
            vertexUi
        );
        return vertexUi;
    };

    api.Self.prototype.integrate = function (newVertexUri) {
        api.removeFromCache(
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
        var vertex = RelativeTreeVertex.createFromHtml(
            this.html
        );
        vertex.rebuildMenuButtons();
        EventBus.publish(
            '/event/ui/html/vertex/created/',
            vertex
        );
        return vertex;
    };
    return api;
});