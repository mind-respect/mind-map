/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.bubble_factory"
], function ($, BubbleFactory) {
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
            var inLabelButtonHtml = selected.getSimilarButtonHtml(this);
            inLabelButtonHtml.removeClass("disabled");
            inLabelButtonHtml[
                canActionBePerformed ?
                    "removeClass" : "addClass"
                ]("hidden");
        }
        else if (!this.isForWholeGraph()) {
            this._hideMenuForGraphElements(selected);
        }
        if (this.canActionBePossiblyMade(controller)) {
            buttonHtml.removeClass("hidden");
            if (!this.canActionBePossiblyMadeIfMultiple(controller) || !this.canActionBePossiblyMadeIfSingle(controller)) {
                buttonHtml[
                    canActionBePerformed ?
                        "removeClass" : "addClass"
                    ]("hidden");
                return canActionBePerformed;
            } else {
                var className = this.hideIfDisabled(controller) ? "hidden" : "disabled";
                buttonHtml[
                    canActionBePerformed ?
                        "removeClass" : "addClass"
                    ](className);
                return canActionBePerformed;
            }
        } else {
            buttonHtml.removeClass("disabled");
            buttonHtml.addClass("hidden");
            return false;
        }

    };
    GraphElementButton.prototype.canActionBePossiblyMade = function (controller) {
        return controller[
            this.getAction()
            ] !== undefined;
    };

    GraphElementButton.prototype.canActionBePossiblyMadeIfMultiple = function (controller) {
        return !controller.isMultiple() || controller[
        this.getAction() + "ManyIsPossible"
            ] === true;
    };

    GraphElementButton.prototype.canActionBePossiblyMadeIfSingle = function (controller) {
        return !controller.isSingle() || controller[
        this.getAction() + "SingleIsPossible"
            ] === true;
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
    GraphElementButton.prototype.isForApp = function () {
        return this.html.hasClass("app-button");
    };

    GraphElementButton.prototype.isForGraphElements = function () {
        return !this.isForWholeGraph() && !this.isForApp();
    };

    GraphElementButton.prototype.getAction = function () {
        return this.html.attr(
            "data-action"
        );
    };
    GraphElementButton.prototype.getCombinedKeyShortcut = function () {
        return this.html.attr(
            "data-combinedShortcut"
        );
    };
    GraphElementButton.prototype.getAdditionalClasses = function () {
        return this.html.attr(
            "data-additionalClass"
        );
    };
    GraphElementButton.prototype.hasCombinedKeyShortcut = function () {
        return this.getCombinedKeyShortcut() !== undefined;
    };
    GraphElementButton.prototype.cloneInto = function (container) {
        //avoiding copy behavior because it breaks bootstrap tooltip
        var copyBehavior = false;
        return api.fromHtml(
            this.html.clone(
                copyBehavior
            ).appendTo(
                container
            )
        );
    };
    GraphElementButton.prototype.canBeInLabel = function () {
        return this.html.hasClass(
            "in-label-button"
        );
    };
    GraphElementButton.prototype.shouldBeVisibleInGraphElementLabel = function (graphElementUi) {
        var controller = graphElementUi.getController();
        var canShowActionButtonInLabel = controller[this.getAction() + "CanShowInLabel"];
        return canShowActionButtonInLabel === undefined ? $.Deferred().resolve(false) : canShowActionButtonInLabel.bind(controller)();
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
    GraphElementButton.prototype.isDisabled = function () {
        return this.html.hasClass("disabled");
    };

    GraphElementButton.prototype.hideIfDisabled = function (controller) {
        var action = controller[
        this.getAction() + "HideIfDisabled"
            ];
        return action && action() === true;
    };

    GraphElementButton.prototype.changeIfGraphElementUiLeftOrRight = function (controller) {
        if (controller.isMultiple()) {
            return;
        }
        var graphElementUi = controller.getUi();
        if (graphElementUi.length === 0) {
            return;
        }
        var action = graphElementUi[this.getAction() + "StyleButton"];
        if (action) {
            action.call(graphElementUi, this);
        }
    };

    GraphElementButton.prototype._getParentBubbleHtml = function () {
        return this.html.closest(".bubble");
    };
    return api;
});
