/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.relative_tree_vertex",
    "triple_brain.ui.graph_element",
    "triple_brain.bubble"
], function (RelativeTreeVertex, GraphElementUi, Bubble) {
    "use strict";
    var api = {};
    api.get = function(){
        return api.withHtml(
            $(".schema.vertex")
        );
    };
    api.withHtml = function (html) {
        return new Self(html);
    };
    api.getWhenEmptyLabel = function(){
        return "schema";
    };
    function Self(html) {
        this.html = html;
        this.bubble = Bubble.withHtmlFacade(this);
        RelativeTreeVertex.Object.apply(this);
        this.init(html);
    }
    Self.prototype = new RelativeTreeVertex.Object;
    Self.prototype.getGraphElementType = function () {
        return GraphElementUi.Types.Schema;
    };
    Self.prototype.hasChildren = function () {
        return this.bubble.hasChildren();
    };
    Self.prototype.getTopMostChild = function () {
        return this.bubble.getTopMostChild();
    };
    return api;
});