/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.tree_edge",
    "triple_brain.edge_ui",
    "triple_brain.graph_element_ui",
    "triple_brain.event_bus",
    "triple_brain.mind_map_info"
], function (TreeEdge, EdgeUi, GraphElementUi, EventBus, MindMapInfo) {
    "use strict";
    var api = {};
    TreeEdge.buildCommonConstructors(api);
    api.createFromHtmlAndUri = function (html, uri) {
        var relationSuggestion = new api.Self(html);
        relationSuggestion.setUri(uri);
        api.initCache(relationSuggestion);
        TreeEdge.initCache(
            relationSuggestion
        );
        EdgeUi.initCache(
            relationSuggestion
        );
        return relationSuggestion;
    };
    api.getWhenEmptyLabel = function () {
        return "suggestion";
    };
    api.Self = function (html) {
        this.html = html;
        TreeEdge.Self.apply(this);
        this.init(html);
    };
    api.Self.prototype = new TreeEdge.Self();
    api.Self.prototype.getGraphElementType = function () {
        return GraphElementUi.Types.RelationSuggestion;
    };

    api.Self.prototype.getModel = function () {
        return this.model.getSameAs();
    };

    api.Self.prototype.getSuggestion = function () {
        return this.model;
    };

    api.Self.prototype.removeFromCache = function () {
        api.removeFromCache(
            this.getUri(),
            this.getId()
        );
        TreeEdge.removeFromCache(
            this.getUri(),
            this.getId()
        );
        EdgeUi.removeFromCache(
            this.getUri(),
            this.getId()
        );
    };

    api.Self.prototype.integrate = function (newRelationUri, destinationVertex) {
        this.removeFromCache();
        this.html.removeClass(
            "suggestion"
        ).data(
            "source_vertex_id",
            this.getParentBubble().getId()
        ).data(
            "destination_vertex_id",
            destinationVertex.getId()
        );
        this.getLabel().attr(
            "placeholder", TreeEdge.getWhenEmptyLabel()
        );
        var isFromComparison = this.getSuggestion().getOrigin().isFromComparison();
        var edge = TreeEdge.createFromHtmlAndUri(
            this.html,
            newRelationUri
        );
        edge.setModel(
            this.getModel()
        );
        edge.rebuildMenuButtons();
        if(isFromComparison){
            edge.setComparedWith(
                this.getComparedWith()
            );
            edge.quitCompareAddOrRemoveMode();
            edge.refreshComparison();
        }else if(MindMapInfo.isInCompareMode()){
            edge.setAsComparisonSuggestionToRemove();
        }
        EventBus.publish(
            '/event/ui/html/edge/created/',
            edge
        );
        return edge;
    };
    return api;
});