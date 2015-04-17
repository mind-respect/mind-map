/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.tree_edge",
    "triple_brain.graph_element_ui",
    "triple_brain.event_bus"
], function (TreeEdge, GraphElementUi, EventBus) {
    "use strict";
    var api = {};
    api.getWhenEmptyLabel = function () {
        return "suggestion"
    };
    api.withHtml = function(html){
        return new Self(html);
    };
    function Self(html){
        this.html = html;
        TreeEdge.Self.apply(this);
        this.init(html);
    }
    Self.prototype = new TreeEdge.Self;
    Self.prototype.getGraphElementType = function () {
        return GraphElementUi.Types.RelationSuggestion;
    };
    Self.prototype.integrate = function (newRelationUri, destinationVertex) {
        this.setUri(
            newRelationUri
        );
        this.html.removeClass(
            "suggestion"
        ).data(
            "source_vertex_id",
            destinationVertex.getParentVertex().getId()
        ).data(
            "destination_vertex_id",
            destinationVertex.getId()
        );
        this.getLabel().attr(
            "placeholder", TreeEdge.getWhenEmptyLabel()
        );
        TreeEdge.removeIdFromCache(this.getId());
        var edge = new TreeEdge.withHtml(
            this.html
        );
        edge.rebuildMenuButtons();
        EventBus.publish(
            '/event/ui/html/edge/created/',
            edge
        );
        return edge;
    };
    return api;
});