/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
], function ($) {
    var api = {};
    api.fromHtml = function (html) {
        return new Object(
            html
        );
    };
    return api;
    function Object(html) {
        var self = this;
        this.showOnlyIfApplicable = function (clickHandler, selectedElements) {
            html[
                self.canActionBePerformedOnSelectedElements(
                    selectedElements, clickHandler
                ) ?
                    "show" : "hide"
                ]();
        };
        this.canActionBePossiblyMade = function (clickHandler) {
            return clickHandler[
                self.getAction()
                ] !== undefined;
        };
        this.canActionBePerformedOnSelectedElements = function (selectedElements, clickHandler) {
            if (!self.canActionBePossiblyMade(clickHandler)) {
                return false;
            }
            var methodToCheckIfActionCanBePerformedForElements = clickHandler[
                self.getAction() + "CanDo"
                ];
            if (undefined === methodToCheckIfActionCanBePerformedForElements) {
                return true;
            }
            return methodToCheckIfActionCanBePerformedForElements(
                selectedElements
            );
        };
        this.getHtml = function () {
            return html;
        };
        this.getAction = function () {
            return html.attr(
                "data-action"
            );
        };
        this.getIconClass = function () {
            return html.attr(
                "data-icon"
            );
        };
        this.cloneInto = function (container) {
            var copyBehavior = true;
            html.clone(copyBehavior).appendTo(container);
        };
    }
});