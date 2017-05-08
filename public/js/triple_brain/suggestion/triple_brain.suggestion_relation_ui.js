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
    api.createFromHtml = function (html) {
        var relationSuggestion = new api.SuggestionRelationUi(html);
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
    api.SuggestionRelationUi = function (html) {
        this.html = html;
        TreeEdge.TreeEdge.apply(this);
        this.init(html);
    };
    api.SuggestionRelationUi.prototype = new TreeEdge.TreeEdge();
    api.SuggestionRelationUi.prototype.getGraphElementType = function () {
        return GraphElementUi.Types.RelationSuggestion;
    };

    api.SuggestionRelationUi.prototype.getModel = function () {
        return this.model.getSameAs();
    };

    api.SuggestionRelationUi.prototype.getSuggestion = function () {
        return this.model;
    };

    api.SuggestionRelationUi.prototype.removeFromCache = function () {
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

    api.SuggestionRelationUi.prototype.integrate = function (newRelationUri, destinationVertex) {
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
        this.html.data(
            "uri",
            newRelationUri
        );
        var edge = TreeEdge.createFromHtml(
            this.html
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