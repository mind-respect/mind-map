/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
],function($){
        var api = {};
        api.makeHtmlAPeripheralMenu = function(html){
            $(html).prepend(
                "<span class='close_button'>&#10006;"+
                "</span>"
            );
    }
        return api;
    }
);