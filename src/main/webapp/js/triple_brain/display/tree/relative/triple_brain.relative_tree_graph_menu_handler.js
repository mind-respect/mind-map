/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.selection_handler",
    "triple_brain.mind_map_info"
], function(SelectionHandler, MindMapInfo){
    var api = {};
    api.select = function(){
        SelectionHandler.handleButtonClick();
    };
    api.selectCanDo = function(){
        return !MindMapInfo.isSchemaMode();
    };
    return api;
});
 