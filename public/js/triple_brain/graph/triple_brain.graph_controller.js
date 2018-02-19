/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.selection_handler",
    "triple_brain.mind_map_info",
    "triple_brain.graph_ui",
    "triple_brain.graph_displayer",
    "triple_brain.vertex_ui",
    "triple_brain.vertex",
    "triple_brain.graph_element_ui",
    "triple_brain.group_relation_ui",
    "triple_brain.compare_flow",
    "triple_brain.vertex_service",
    "triple_brain.id_uri"

], function ($, SelectionHandler, MindMapInfo, GraphUi, GraphDisplayer, VertexUi, Vertex, GraphElementUi, GroupRelationUi, CompareFlow, VertexService, IdUri) {
    "use strict";
    var api = {};
    api.expandAllCanDo = function () {
        var canDo = false;
        GraphElementUi.visitAll(function(graphElementUi){
            if(graphElementUi.getController().expandCanDo()){
                canDo = true;
                return false;
            }
        });
        return canDo;
    };

    api.expandAll = function () {
        GraphElementUi.getCenterBubble().getController().expand();
    };
    api.compare = function () {
        CompareFlow.enter();
    };

    api.createVertex = function () {
        VertexService.createVertex(function (newVertex) {
            var serverFormatFacade = Vertex.fromServerFormat(
                newVertex
            );
            if (MindMapInfo.isTagCloudFlow() || MindMapInfo.isAuthenticatedLandingPageFlow()) {
                window.location = IdUri.htmlUrlForBubbleUri(serverFormatFacade.getUri());
                return;
            }
            GraphDisplayer.displayUsingCentralBubbleUri(
                serverFormatFacade.getUri()
            );
        });
    };

    api.selectTree = function () {
        GraphElementUi.getCenterBubble().selectTree();
    };

    api.selectTreeCanDo = function () {
        return VertexUi.getNumber() > SelectionHandler.getNbSelectedVertices();
    };

    api.getUi = function () {
        return [];
    };
    return api;
});
 