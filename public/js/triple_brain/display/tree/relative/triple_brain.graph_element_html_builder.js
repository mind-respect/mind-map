/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.bubble_factory",
    "triple_brain.suggestion_service",
    "triple_brain.friendly_resource_service",
    "triple_brain.selection_handler",
    "triple_brain.graph_ui",
    "triple_brain.graph_element_main_menu"
], function ($, EventBus, BubbleFactory, SuggestionService, FriendlyResourceService, SelectionHandler, GraphUi, GraphElementMainMenu) {
    "use strict";
    var enterKeyCode = 13,
        api = {};
    api.setUpLabel = function (label) {
        label.blur(function () {
            var $input = $(this),
                elementUi = BubbleFactory.fromSubHtml($input);
            elementUi.getModel().setLabel(elementUi.text());
            elementUi.labelUpdateHandle();
            if (!elementUi.hasTextChangedAfterModification()) {
                return;
            }
            if (elementUi.isSuggestion()) {
                var vertexSuggestion = elementUi.isRelationSuggestion() ?
                    elementUi.getTopMostChildBubble() : elementUi;
                SuggestionService.accept(
                    vertexSuggestion,
                    updateLabelToService
                );
            } else {
                updateLabelToService();
            }
            function updateLabelToService() {
                FriendlyResourceService.updateLabel(
                    elementUi,
                    elementUi.getModel().getLabel()
                );
            }
        }).keydown(function (event) {
            if (enterKeyCode === event.which) {
                if (!GraphUi.hasSelectedFromAutocomplete()) {
                    event.preventDefault();
                    $(this).blur();
                }
            }
        });
    };

    api.buildInLabelButtons = function (graphElement) {
        var container = $(
            "<div class='in-label-buttons'>"
        );
        GraphElementMainMenu.visitButtons(function (button) {
            if (button.canBeInLabel()) {
                var cloneHtml = button.cloneInto(container);
                if ("note" === cloneHtml.data("action")) {
                    var noteWithoutHtml = $("<div/>").html(
                        graphElement.getNote()
                    ).text();
                    cloneHtml.attr(
                        "title",
                        noteWithoutHtml
                    );
                }
            }
        });
        return container;
    };

    api.setUpIdentifications = function (serverFormat, graphElement) {
        setup(
            graphElement.setTypes,
            serverFormat.getTypes,
            graphElement.addType
        );
        setup(
            graphElement.setSameAs,
            serverFormat.getSameAs,
            graphElement.addSameAs
        );
        setup(
            graphElement.setGenericIdentifications,
            serverFormat.getGenericIdentifications,
            graphElement.addGenericIdentification
        );
        function setup(identificationsSetter, identificationGetter, addFctn) {
            identificationsSetter.call(graphElement, []);
            $.each(identificationGetter.call(serverFormat, []), function () {
                var identificationFromServer = this;
                addFctn.call(
                    graphElement,
                    identificationFromServer
                );
            });
        }
    };
    return api;
});