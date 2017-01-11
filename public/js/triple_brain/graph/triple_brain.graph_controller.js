/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.selection_handler",
    "triple_brain.mind_map_info",
    "triple_brain.graph_ui",
    "triple_brain.vertex_ui",
    "triple_brain.graph_element_ui",
    "triple_brain.group_relation_ui",
    "triple_brain.compare_flow"
], function ($, SelectionHandler, MindMapInfo, GraphUi, VertexUi, GraphElementUi, GroupRelationUi, CompareFlow) {
    "use strict";
    var api = {};
    api.select = function () {
        SelectionHandler.handleButtonClick();
    };
    api.selectCanDo = function () {
        return !MindMapInfo.isSchemaMode();
    };
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
    api.zoomIn = function () {
        GraphUi.zoom(
            0.1
        );
    };
    api.zoomOut = function () {
        GraphUi.zoom(
            -0.1
        );
    };
    api.wikidataOn = function(){
        GraphElementUi.activateWikidataForInBubbleEdition();
    };
    api.wikidataOff = function(){
        GraphElementUi.deactivateWikidataForInBubbleEdition();
    };
    api.wikidataOnCanDo = function(){
        return !GraphElementUi.isWikidataActiveForInBubbleEdition();
    };
    api.wikidataOffCanDo = function(){
        return GraphElementUi.isWikidataActiveForInBubbleEdition();
    };
    api.undo = function(){
        alert('bonjour');
    };
    api.getUi = function () {
        return [];
    };
    return api;
});
 