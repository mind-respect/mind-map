/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.selection_handler"
], function(SelectionHandler){
    var api = {};
    api.select = function(){
        SelectionHandler.handleButtonClick();
    };
    return api;
});
 