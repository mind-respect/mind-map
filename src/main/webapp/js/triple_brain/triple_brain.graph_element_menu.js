/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph_displayer",
    "jquery-ui"
], function($, GraphDisplayer){
    var api = {};
    api.makeForMenuContentAndGraphElement = function(menuContent, graphElement, extraOptions){
        var dialogClass = "graph-element-menu",
        horizontalPosition = getHorizontalPosition(),
        options = {
            position : {
                of:graphElement.getLabel(),
                my: horizontalPosition.my + " center",
                at: horizontalPosition.at + " right top",
                collision: 'none'
            },
            dialogClass:dialogClass,
            title : graphElement.getTextOrDefault(),
            close: function(){
                $(this).dialog("destroy").remove();
            }
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
        menuContent.addClass(
            "html-content"
        ).i18n().dialog(
            options
        ).prev(
            ".ui-dialog-titlebar"
        ).find("button").append("<i class='fa fa-times'></i>");
        menuContent.closest(".graph-element-menu").centerOnScreen();
        function getHorizontalPosition(){
            var positionDialogToRight = {
                "my" : "left",
                "at" : "right"
                },
                positionDialogToLeft = {
                    "my" : "right",
                    "at" : "left"
                };
            if(!GraphDisplayer.canGetIsToTheLeft()){
                return positionDialogToRight;
            }
            var isConcept = graphElement.isVertex();
            if(isConcept){
                return graphElement.isToTheLeft() ?
                    positionDialogToLeft : positionDialogToRight;
            }else{
                return graphElement.isLeftOfCenterVertex ?
                    positionDialogToRight :
                    positionDialogToLeft
            }
        }
    };
    api.fromContentComponent = function(component){
        return new GraphElementMenu(
            component.closest(".html-content")
        );
    };
    return api;
    function GraphElementMenu(htmlContent){
        this.close = function(){
            htmlContent.dialog("close");
        };
    }
});