/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.mind-map_template",
        "triple_brain.event_bus",
        "triple_brain.graph_displayer",
        "triple_brain.bubble_factory"
    ],
    function ($, MindMapTemplate, EventBus, GraphDisplayer, BubbleFactory) {
        "use strict";
        var api = {};
        api.withBubble = function (bubble) {
            return new HiddenNeighborPropertiesIndicator(bubble);
        };
        api.fromHtml = function (html) {
            var hiddenNeighborPropertiesIndicator = new HiddenNeighborPropertiesIndicator(
                BubbleFactory.fromSubHtml(html)
            );
            hiddenNeighborPropertiesIndicator.hiddenNeighborPropertiesContainer = html;
            return hiddenNeighborPropertiesIndicator;
        };
        function HiddenNeighborPropertiesIndicator(bubble) {
            this.bubble = bubble;
        }

        HiddenNeighborPropertiesIndicator.prototype.build = function () {

            this.hiddenNeighborPropertiesContainer = $(
                MindMapTemplate[
                    'hidden_property_container'
                    ].merge()
            ).data("vertex", this.bubble);
            var div = $("<div class='hidden-properties-content'>").append(
                this.buildContent()
            ).attr(
                "title",
                $.i18n.translate("hidden_properties_tooltip")
            ).popoverLikeToolTip();
            this.hiddenNeighborPropertiesContainer.append(
                div
            );
            this.bubble.getHtml()[this.bubble.isToTheLeft() ? "prepend" : "append"](
                this.hiddenNeighborPropertiesContainer
            );
            this.hiddenNeighborPropertiesContainer.on(
                "click",
                handleHiddenPropertiesContainerClick
            );
            var loadingAnimation = $('<i class="loading hidden fa fa-refresh fa-spin fa-4x fa-fw"></i>');
            this.hiddenNeighborPropertiesContainer.append(
                loadingAnimation
            );
        };

        HiddenNeighborPropertiesIndicator.prototype.buildContent = function(){
            var isLeftOriented = this.bubble.isToTheLeft();
            var plusSign = "+";
            var numberOfHiddenRelations = this.bubble.getNumberOfHiddenRelations();
            return (isLeftOriented ? numberOfHiddenRelations : plusSign) +
                " " + (isLeftOriented ? plusSign : numberOfHiddenRelations);
        };

        HiddenNeighborPropertiesIndicator.prototype._updateContent = function(){
            this._getContent().text(
                this.buildContent()
            );
        };

        HiddenNeighborPropertiesIndicator.prototype.remove = function () {
            this.hiddenNeighborPropertiesContainer.remove();
        };

        HiddenNeighborPropertiesIndicator.prototype.hide = function () {
            this.hiddenNeighborPropertiesContainer.addClass("hidden");
            this._getContent().addClass("hidden");
        };

        HiddenNeighborPropertiesIndicator.prototype.show = function () {
            this._getContent().removeClass("hidden");
            this._getLoading().addClass("hidden");
            this.hiddenNeighborPropertiesContainer.removeClass("hidden");
            this._updateContent();
        };

        HiddenNeighborPropertiesIndicator.prototype.isVisible = function () {
            return !this.hiddenNeighborPropertiesContainer.hasClass("hidden") &&
                (!this._getContent().hasClass("hidden") ||
                    !this._getLoading().hasClass("hidden"));
        };

        HiddenNeighborPropertiesIndicator.prototype.getHtml = function () {
            return this.hiddenNeighborPropertiesContainer;
        };

        HiddenNeighborPropertiesIndicator.prototype.convertToLeft = function () {
            this.getHtml().prependTo(
                this.bubble.getHtml()
            );
            this._updateContent();
        };

        HiddenNeighborPropertiesIndicator.prototype.convertToRight = function () {
            this.getHtml().appendTo(
                this.bubble.getHtml()
            );
            this._updateContent();
        };


        HiddenNeighborPropertiesIndicator.prototype._getContent = function(){
            return this.getHtml().find(".hidden-properties-content");
        };

        HiddenNeighborPropertiesIndicator.prototype._getLoading = function(){
            return this.hiddenNeighborPropertiesContainer.find(".loading");
        };

        HiddenNeighborPropertiesIndicator.prototype.getBubble = function () {
            return this.bubble;
        };

        HiddenNeighborPropertiesIndicator.prototype.showLoading = function () {
            this._getLoading().removeClass("hidden");
            this._getContent().addClass("hidden");
            this.hiddenNeighborPropertiesContainer.removeClass("hidden");
        };

        HiddenNeighborPropertiesIndicator.prototype.hideLoading = function () {
            this._getLoading().addClass("hidden");
            this.hiddenNeighborPropertiesContainer.addClass("hidden");
        };

        function handleHiddenPropertiesContainerClick(event) {
            event.stopPropagation();
            if (!GraphDisplayer.canAddChildTree()) {
                return;
            }
            var hiddenPropertiesContainer = api.fromHtml(
                $(this)
            );
            hiddenPropertiesContainer.getBubble().getController().expand();
        }

        return api;
    }
);