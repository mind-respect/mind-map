/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph_displayer",
    "jquery-ui"
], function($, GraphDisplayer){
    var api = {};
    api.makeForMenuContentAndGraphElement = function(menuContent, graphElement, extraOptions){
        var dialogClass = "graph-element-menu";
        var horizontalPosition = getHorizontalPosition();
        var options = {
            position : {
                of:graphElement.getLabel(),
                my: horizontalPosition.my + " center",
                at: horizontalPosition.at + " right top",
                collision: 'none'
            },
            dialogClass:dialogClass,
            title : graphElement.text(),
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
        ).centerOnScreen();
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
            var isConcept = graphElement.isConcept();
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