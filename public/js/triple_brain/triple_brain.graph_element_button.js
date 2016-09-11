/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.bubble_factory",
    "triple_brain.mind_map_info"
], function ($, BubbleFactory, MindMapInfo) {
    "use strict";
    var api = {};
    api.fromHtml = function (html) {
        return new GraphElementButton(
            html
        );
    };
    function GraphElementButton(html) {
        this.html = html;
    }

    GraphElementButton.prototype.showOnlyIfApplicable = function (controller) {
        var selected = controller.getUi();
        var canActionBePerformed = this.canActionBePerformedWithController(
            controller
        );
        var buttonHtml = this.getHtml();
        var onlyOneSelected = !Array.isArray(selected);
        if (onlyOneSelected) {
            buttonHtml = selected.getSimilarButtonHtml(this);
        }
        else if (!this.isForWholeGraph()) {
            this._hideMenuForGraphElements(selected);
        }
        buttonHtml[
            canActionBePerformed ?
                "removeClass" : "addClass"
            ]("hidden");
    };
    GraphElementButton.prototype.canActionBePossiblyMade = function (controller) {
        return controller[
                this.getAction()
                ] !== undefined;
    };
    GraphElementButton.prototype.canActionBePerformedWithController = function (controller) {
        if (!this.canActionBePossiblyMade(controller)) {
            return false;
        }
        var methodToCheckIfActionCanBePerformedForElements = controller[
        this.getAction() + "CanDo"
            ];
        if (undefined === methodToCheckIfActionCanBePerformedForElements) {
            return true;
        }
        return methodToCheckIfActionCanBePerformedForElements.call(
            controller
        );
    };
    GraphElementButton.prototype.getHtml = function () {
        return this.html;
    };
    GraphElementButton.prototype.isForWholeGraph = function () {
        return this.html.hasClass("whole-graph-button");
    };
    GraphElementButton.prototype.getAction = function () {
        return this.html.attr(
            "data-action"
        );
    };
    GraphElementButton.prototype.getIconClass = function () {
        return this.html.attr(
            "data-icon"
        );
    };
    GraphElementButton.prototype.cloneInto = function (container) {
        var copyBehavior = true;
        return this.html.clone(
            copyBehavior
        ).appendTo(
            container
        );
    };
    GraphElementButton.prototype.canBeInLabel = function () {
        return this.html.hasClass(
            "in-label-button"
        );
    };
    GraphElementButton.prototype.shouldBeVisibleInGraphElementLabel = function (graphElement) {
        switch (this.getAction()) {
            case "note":
                return graphElement.hasNote();
            case "identify":
                return graphElement.getModel().hasIdentifications();
            case "visitOtherInstances":
                return graphElement.hasOtherInstances();
            case "makePrivate":
                return graphElement.isVertex() && graphElement.getModel().isPublic() && !MindMapInfo.isViewOnly();
            case "makePublic":
                return graphElement.isVertex() && !graphElement.getModel().isPublic() && !MindMapInfo.isViewOnly();
            case "isPublic":
                return !graphElement.isVertex() && graphElement.getModel().isPublic() && !MindMapInfo.isViewOnly();
            case "accept":
                return graphElement.isDisplayingComparison();
            default:
                return false;
        }
    };
    GraphElementButton.prototype._hideMenuForGraphElements = function (elements) {
        $.each(elements, function () {
            var element = this;
            element.hideMenu();
        });
    };
    GraphElementButton.prototype.isInBubble = function () {
        return this._getParentBubbleHtml().length > 0;
    };
    GraphElementButton.prototype.getParentBubble = function () {
        return BubbleFactory.fromHtml(
            this._getParentBubbleHtml()
        );
    };
    GraphElementButton.prototype._getParentBubbleHtml = function () {
        return this.html.closest(".bubble");
    };
    return api;
});