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
        return {
            withVertex: function (bubble) {
                return new HiddenNeighborPropertiesIndicator(bubble);
            }
        };
        function HiddenNeighborPropertiesIndicator(bubble) {
            var hiddenNeighborPropertiesContainer;
            this.build = function () {
                var numberOfHiddenRelationsToFlag = bubble.getNumberOfRelationsToFlag();
                if (numberOfHiddenRelationsToFlag > 10) {
                    numberOfHiddenRelationsToFlag = 10;
                }
                var isLeftOriented = bubble.isToTheLeft();
                hiddenNeighborPropertiesContainer = $(
                    MindMapTemplate[
                        'hidden_property_container'
                        ].merge()
                ).data("vertex", bubble);
                var imageUrl = "/css/images/icons/vertex/" +
                    numberOfHiddenRelationsToFlag +
                    "_" +
                    (isLeftOriented ? "left_" : "") +
                    "hidden_properties.svg";
                var img = $("<img>").attr(
                    "src",
                    imageUrl
                ).attr(
                    "data-toggle", "tooltip"
                ).attr(
                    "title",
                    $.i18n.translate("hidden_properties_tooltip")
                );
                hiddenNeighborPropertiesContainer.append(
                    img
                );
                bubble.getHtml()[isLeftOriented ? "prepend" : "append"](
                    hiddenNeighborPropertiesContainer
                );
                hiddenNeighborPropertiesContainer.tooltip().on(
                    "click",
                    handleHiddenPropertiesContainerClick
                );
            };
            this.remove = function () {
                hiddenNeighborPropertiesContainer.remove();
            };
        }

        function handleHiddenPropertiesContainerClick(event) {
            if (!GraphDisplayer.canAddChildTree()) {
                return;
            }
            var $this = $(this);
            var vertex = $this.data("vertex");
            vertex.addChildTree();
        }
    }
);