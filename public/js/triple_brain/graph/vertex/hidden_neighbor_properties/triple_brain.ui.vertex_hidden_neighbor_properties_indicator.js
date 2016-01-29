/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.mind-map_template",
        "triple_brain.event_bus",
        "triple_brain.graph_displayer"
    ],
    function ($, MindMapTemplate, EventBus, GraphDisplayer) {
        "use strict";
        var api = {};
        api.withVertex = function (bubble) {
            return new HiddenNeighborPropertiesIndicator(bubble);
        };
        function HiddenNeighborPropertiesIndicator(bubble) {
            this.bubble = bubble;
        }

        HiddenNeighborPropertiesIndicator.prototype.build = function(){
            var isLeftOriented = this.bubble.isToTheLeft();
            this.hiddenNeighborPropertiesContainer = $(
                MindMapTemplate[
                    'hidden_property_container'
                    ].merge()
            ).data("vertex", this.bubble);
            var imageUrl = "/css/images/icons/vertex/" +
                (isLeftOriented ? "left-" : "") +
                "floral-design.svg";
            var img = $("<img>").attr(
                "src",
                imageUrl
            ).attr(
                "data-toggle", "tooltip"
            ).attr(
                "title",
                $.i18n.translate("hidden_properties_tooltip")
            );
            this.hiddenNeighborPropertiesContainer.append(
                img
            );
            this.bubble.getHtml()[isLeftOriented ? "prepend" : "append"](
                this.hiddenNeighborPropertiesContainer
            );
            this.hiddenNeighborPropertiesContainer.tooltip({
                delay:{"show":0, "hide":0}
            }).on(
                "click",
                handleHiddenPropertiesContainerClick
            );
        };

        HiddenNeighborPropertiesIndicator.prototype.remove = function(){
            this.hiddenNeighborPropertiesContainer.remove();
        };

        HiddenNeighborPropertiesIndicator.prototype.hide = function(){
            this.hiddenNeighborPropertiesContainer.css("visibility","hidden");
        };

        HiddenNeighborPropertiesIndicator.prototype.show = function(){
            this.hiddenNeighborPropertiesContainer.css("visibility","visible");
        };

        HiddenNeighborPropertiesIndicator.prototype._getHtml = function(){
            return this.hiddenNeighborPropertiesContainer;
        };

        function handleHiddenPropertiesContainerClick() {
            if (!GraphDisplayer.canAddChildTree()) {
                return;
            }
            var $this = $(this);
            var vertex = $this.data("vertex");
            vertex.addChildTree();
        }
        return api;
    }
);