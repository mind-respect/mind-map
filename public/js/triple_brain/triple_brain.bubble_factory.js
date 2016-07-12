/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_displayer",
    "triple_brain.graph_element_type",
    "triple_brain.id_uri"
], function (GraphDisplayer, GraphElementType, IdUri) {
    "use strict";
    var api = {};
    api.fromHtml = function (html) {
        var uiSelector;
        if (html.hasClass("vertex")) {
            if (html.hasClass("suggestion")) {
                uiSelector = GraphDisplayer.getVertexSuggestionSelector();
            } else if (html.hasClass("schema")) {
                uiSelector = GraphDisplayer.getSchemaSelector();
            } else {
                uiSelector = GraphDisplayer.getVertexSelector();
            }
        } else if (html.hasClass("relation")) {
            if (html.hasClass("suggestion")) {
                uiSelector = GraphDisplayer.getRelationSuggestionSelector();
            } else if (html.hasClass("property")) {
                uiSelector = GraphDisplayer.getPropertySelector();
            } else if (html.hasClass("group-relation")) {
                uiSelector = GraphDisplayer.getGroupRelationSelector();
            } else {
                uiSelector = GraphDisplayer.getEdgeSelector();
            }
        }
        var uiFacade = uiSelector.withHtml(html);
        if (undefined === uiFacade) {
            /*
             todo this case should not happen but it did using npm test only somehow
             should review the cache system
             also the builder *html_builder system
             */
            uiFacade = uiSelector.createFromHtmlAndUri(html, html.data("uri"));
        }
        return uiFacade;
    };
    api.fromSubHtml = function (html) {
        return api.fromHtml(
            html.closest(".bubble")
        );
    };
    api.getGraphElementFromUri = function (uri) {
        return api.getSelectorFromType(
            IdUri.getGraphElementTypeFromUri(uri)
        ).withUri(uri)[0];
    };
    api.getSelectorFromType = function (type) {
        switch (type) {
            case GraphElementType.Vertex :
            {
                return GraphDisplayer.getVertexSelector();
            }
            case GraphElementType.Relation :
            {
                return GraphDisplayer.getEdgeSelector();
            }
            case GraphElementType.GroupRelation :
            {
                return GraphDisplayer.getGroupRelationSelector();
            }
            case GraphElementType.Schema :
            {
                return GraphDisplayer.getSchemaSelector();
            }
            case GraphElementType.Property :
            {
                return GraphDisplayer.getPropertySelector();
            }
            case GraphElementType.VertexSuggestion :
            {
                return GraphDisplayer.getVertexSuggestionSelector();
            }
            case GraphElementType.RelationSuggestion :
            {
                return GraphDisplayer.getRelationSuggestionSelector();
            }
        }
    };
    return api;
});