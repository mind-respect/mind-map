/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_displayer",
    "jquery-ui"
], function ($, GraphDisplayer) {
    "use strict";
    var api = {};
    api.setupAutoCompleteSuggestionZIndex = function (input) {
        //http://stackoverflow.com/a/17178927/541493
        input.autocomplete("widget").insertAfter(
            input.closest(".ui-dialog").parent()
        );
    };
    api.makeForMenuContentAndGraphElement = function (menuContent, graphElement, extraOptions) {
        var dialogClass = "graph-element-menu",
            horizontalPosition = getHorizontalPosition(),
            options = {
                position: {
                    of: graphElement.getHtml(),
                    my: horizontalPosition.my + " center",
                    at: horizontalPosition.at + " right top",
                    collision: 'none'
                },
                dialogClass: dialogClass,
                title: graphElement.getTextOrDefault(),
                close: function () {
                    $(this).dialog("destroy").remove();
                }
            };
        if (extraOptions !== undefined) {
            if (extraOptions.dialogClass !== undefined) {
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
        );
        menuContent.closest(".graph-element-menu").centerOnScreen();
        function getHorizontalPosition() {
            var positionDialogToRight = {
                    "my": "left",
                    "at": "right"
                },
                positionDialogToLeft = {
                    "my": "right",
                    "at": "left"
                };
            if (!GraphDisplayer.canGetIsToTheLeft()) {
                return positionDialogToRight;
            }
            return graphElement.isToTheLeft() ?
                positionDialogToLeft : positionDialogToRight;
        }
    };
    api.fromContentComponent = function (component) {
        return new GraphElementMenu(
            component.closest(".html-content")
        );
    };
    return api;
    function GraphElementMenu(htmlContent) {
        this.close = function () {
            htmlContent.dialog("close");
        };
    }
});