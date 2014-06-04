/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph_displayer",
    "triple_brain.event_bus",
    "triple_brain.selection_handler",
    "triple_brain.graph_element_button",
    "jquery-ui"
], function ($, GraphDisplayer, EventBus, SelectionHandler, GraphElementButton) {
    "use strict";
    var api = {},
        _menu;
    api.reset = function () {
        initButtons();
        getMenu().draggable({
            stop: function () {
                var menu = $(this);
                var topOff = menu.offset().top - $(window).scrollTop();
                menu.css("top", topOff);
                menu.css("position", "fixed")
            }
        });
        function initButtons() {
            api.visitButtons(function (button) {
                var icon = $("<i>").addClass(
                        "fa " + button.getIconClass()
                );
                button.getHtml().addClass(
                    "graph-element-button"
                ).append(icon).on(
                    "click",
                    function (event) {
                        event.stopPropagation();
                        var button = $(this);
                        var method = button.attr("data-action");
                        var selectedElements = 1 === SelectionHandler.getNbSelected() ?
                            SelectionHandler.getSingleElement() : SelectionHandler.getSelectedElements();
                        getCurrentClickHandler()[
                            method
                            ](
                            event,
                            selectedElements
                        );
                    }
                );
            });
        }
    };
    api.visitButtons = function (visitor) {
        $.each(getButtonsHtml(), function () {
            visitor(
                GraphElementButton.fromHtml(
                    $(this)
                )
            );
        });
    };
    EventBus.subscribe("/event/ui/selection/changed", selectionChangedHandler);
    return api;

    function selectionChangedHandler(event, selectionInfo){
        var clickHandler = updateCurrentClickHandler(selectionInfo);
        var selectedElements = 1 === selectionInfo.getNbSelected() ?
            selectionInfo.getSingleElement() :
            selectionInfo.getSelectedElements();
        api.visitButtons(function (button) {
            button.showOnlyIfApplicable(
                clickHandler,
                selectedElements
            );
        });
    }

    function getButtonsHtml() {
        return getMenu().find("> button");
    }

    function getMenu() {
        if(!_menu){
            _menu = $("#graph-element-menu");
        }
        return _menu;
    }

    function updateCurrentClickHandler(selectedElements) {
        var nbSelectedGraphElements = selectedElements.getNbSelected(),
            currentClickHandler,
            vertexMenuHandler = GraphDisplayer.getVertexMenuHandler(),
            relationMenuHandler = GraphDisplayer.getRelationMenuHandler();
        if (0 === nbSelectedGraphElements) {
            currentClickHandler = GraphDisplayer.getGraphMenuHandler();
        }
        else if (1 === nbSelectedGraphElements) {
            currentClickHandler = selectedElements.getSingleElement().isConcept() ?
                vertexMenuHandler.forSingle() :
                relationMenuHandler.forSingle();
        } else {
            var nbSelectedBubbles = selectedElements.getNbSelectedBubbles();
            var nbSelectedRelations = selectedElements.getNbSelectedRelations();
            if (0 === nbSelectedBubbles) {
                currentClickHandler = relationMenuHandler.forGroup();
            } else if (0 === nbSelectedRelations) {
                currentClickHandler = vertexMenuHandler.forGroup();
            } else {
                currentClickHandler = GraphDisplayer.getGraphElementMenuHandler();
            }
        }
        setCurrentClickHandler(
            currentClickHandler
        );
        return currentClickHandler;
    }

    function setCurrentClickHandler(currentClickHandler) {
        getMenu().data(
            "currentClickHandler",
            currentClickHandler
        );
    }

    function getCurrentClickHandler() {
        return getMenu().data(
            "currentClickHandler"
        );
    }
});