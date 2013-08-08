/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "jquery-ui"
], function($){
    var api = {};
    api.makeForMenuContentAndGraphElement = function(menuContent, graphElement, extraOptions){
        var options = {
            position : {
                of:graphElement.getHtml(),
                collision: 'none',
                modal:true,
                dialogClass:"peripheral-menu"
            },
            title : graphElement.text()
        };
        if(extraOptions !== undefined){
            options = $.extend(
                options,
                extraOptions
            );
        }
        menuContent.i18n();
        menuContent.dialog(options);
        menuContent.centerOnScreen();
    };
    return api;
});