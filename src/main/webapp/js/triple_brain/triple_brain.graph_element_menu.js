/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "jquery-ui"
], function($){
    var api = {};
    api.makeForMenuContentAndGraphElement = function(menuContent, graphElement, extraOptions){
        var dialogClass = "graph-element-menu";
        var options = {
            position : {
                of:graphElement.getHtml(),
                collision: 'none'
            },
            dialogClass:dialogClass,
            title : graphElement.text()
        };
        if(extraOptions !== undefined){
            if(extraOptions.dialogClass !== undefined){
                extraOptions.dialogClass = extraOptions.dialogClass +
                    " " + dialogClass;
            }
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