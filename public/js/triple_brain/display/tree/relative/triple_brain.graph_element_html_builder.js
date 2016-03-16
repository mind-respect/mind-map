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
    "triple_brain.ui.graph",
    "triple_brain.graph_element_main_menu"
], function ($, EventBus, BubbleFactory, SuggestionService, FriendlyResourceService, SelectionHandler, GraphUi, GraphElementMainMenu) {
    "use strict";
    var enterKeyCode = 13,
        api = {};
    api.setUpLabel = function (label) {
        label.blur(function () {
            var $input = $(this),
                element = BubbleFactory.fromSubHtml($input);
            element.leaveEditMode();
            $input.maxChar();
            element.getHtml().centerOnScreen();
            if (!element.hasTextChangedAfterModification()) {
                return;
            }
            if (element.isSuggestion()) {
                var vertexSuggestion = element.isRelationSuggestion() ?
                    element.getTopMostChildBubble() : element;
                SuggestionService.accept(
                    vertexSuggestion,
                    updateLabel
                );
                return;
            } else {
                updateLabel();
            }
            updateLabelsOfElementsWithSameUri();
            function updateLabelsOfElementsWithSameUri() {
                var text = element.text();
                $.each(element.getOtherInstances(), function () {
                    var sameElement = this;
                    sameElement.setText(
                        text
                    );
                });
            }

            function updateLabel() {
                FriendlyResourceService.updateLabel(
                    element,
                    $input.maxCharCleanText()
                );
            }

            SelectionHandler.setToSingleGraphElement(element);

        }).keydown(function (event) {
            if (enterKeyCode === event.which) {
                if (!GraphUi.hasSelectedFromAutocomplete()) {
                    event.preventDefault();
                    $(this).blur();
                }
            }
        });
    };

    api.buildInLabelButtons = function () {
        var container = $(
            "<div class='in-label-buttons'>"
        );
        GraphElementMainMenu.visitButtons(function (button) {
            if (button.canBeInLabel()) {
                button.cloneInto(container);
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