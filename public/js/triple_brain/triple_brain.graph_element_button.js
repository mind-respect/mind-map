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

    GraphElementButton.prototype.showOnlyIfApplicable = function (clickHandler, selected) {
        if(this.isForWholeGraph()){
            return;
        }
        var canActionBePerformed = this.canActionBePerformedOnSelected(
            selected, clickHandler
        );
        var onlyOneSelected = !Array.isArray(selected);
        this.html[
            !onlyOneSelected && canActionBePerformed ?
                "removeClass" : "addClass"
            ]("hidden");
        if (onlyOneSelected) {
            selected.getSimilarButtonHtml(this)[
                canActionBePerformed ?
                    "removeClass" : "addClass"
                ]("hidden");
        }
        else {
            this._hideMenuForGraphElements(selected);
        }
    };
    GraphElementButton.prototype.canActionBePossiblyMade = function (clickHandler) {
        return clickHandler[
            this.getAction()
            ] !== undefined;
    };
    GraphElementButton.prototype.canActionBePerformedOnSelected = function (selected, clickHandler) {
        if (!this.canActionBePossiblyMade(clickHandler)) {
            return false;
        }
        var methodToCheckIfActionCanBePerformedForElements = clickHandler[
            this.getAction() + "CanDo"
            ];
        if (undefined === methodToCheckIfActionCanBePerformedForElements) {
            return true;
        }
        return methodToCheckIfActionCanBePerformedForElements(
            selected
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
    GraphElementButton.prototype.canBeInLabel = function(){
        return this.html.hasClass(
            "in-label-button"
        );
    };
    GraphElementButton.prototype.shouldBeVisibleInGraphElementLabel = function(graphElement){
        switch(this.getAction()){
            case "note": return graphElement.hasNote();
            case "identify": return graphElement.hasIdentifications();
            case "visitOtherInstances": return graphElement.hasOtherInstances();
            default:return false;
        }
    };
    GraphElementButton.prototype._hideMenuForGraphElements = function (elements) {
        $.each(elements, function () {
            var element = this;
            element.hideMenu();
        });
    };
    GraphElementButton.prototype.isInBubble = function(){
        return this._getParentBubbleHtml().length > 0;
    };
    GraphElementButton.prototype.getParentBubble = function(){
        return BubbleFactory.fromHtml(
            this._getParentBubbleHtml()
        );
    };
    GraphElementButton.prototype._getParentBubbleHtml = function(){
        return this.html.closest(".bubble");
    };
    return api;
});