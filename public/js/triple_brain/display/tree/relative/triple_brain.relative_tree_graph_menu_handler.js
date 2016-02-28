/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.selection_handler",
    "triple_brain.mind_map_info",
    "triple_brain.ui.graph"
], function(SelectionHandler, MindMapInfo, GraphUi){
    "use strict";
    var api = {};
    api.select = function(){
        SelectionHandler.handleButtonClick();
    };
    api.selectCanDo = function(){
        return !MindMapInfo.isSchemaMode();
    };
    api.zoomIn = function(){
        GraphUi.zoom(
            0.1
        );
    };
    api.zoomOut = function(){
        GraphUi.zoom(
            -0.1
        );
    };
    return api;
});
 