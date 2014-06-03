/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
], function($){
    "use strict";
    var api = {};
    api.redrawButton = function(){
        return headerMenu().find(".redraw");
    };
    api.showAsGraphButton = function(){
        return headerMenu().find(
            "[data-displayer_name=graph]"
        );
    };
    api.showAsTreeButton = function(){
        return headerMenu().find(
            "[data-displayer_name=relative_tree]"
        );
    };
    return api;
    function headerMenu(){
        return $("#top-panel");
    }
});