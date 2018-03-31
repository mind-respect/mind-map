/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.selection_handler",
    "triple_brain.graph_ui",
    "triple_brain.vertex_ui",
    "triple_brain.graph_element_ui",
    "triple_brain.group_relation_ui",
    "triple_brain.compare_flow",
    "triple_brain.mind_map_info"
], function ($, SelectionHandler, GraphUi, VertexUi, GraphElementUi, GroupRelationUi, CompareFlow, MindMapInfo) {
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

    api.compareCanDo = function(){
        return !MindMapInfo.isViewOnly();
    };

    api.compare = function () {
        CompareFlow.enter();
    };

    api.selectAllBubbles = function () {
        GraphElementUi.getCenterBubble().selectTree();
    };

    api.selectTreeCanDo = function () {
        return VertexUi.getNumber() > SelectionHandler.getNbSelectedVertices();
    };

    api.getUi = function () {
        return [];
    };

    api.isMultiple = function(){
        return false;
    };

    api.isSingle = function () {
        return false;
    };

    return api;
});
