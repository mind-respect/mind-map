/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.graph_displayer",
        "triple_brain.event_bus",
        "triple_brain.selection_handler",
        "triple_brain.graph_element_button",
        "triple_brain.mind_map_info",
        "jquery-ui",
        "jquery.i18next",
        "bootstrap"
    ], function ($, GraphDisplayer, EventBus, SelectionHandler, GraphElementButton, MindMapInfo) {
        "use strict";
        var api = {},
            _menu;
        api.addRelevantButtonsInMenu = function(menuContainer, clickHandler){
            api.visitButtons(function(button){
                if(!button.canActionBePossiblyMade(clickHandler)){
                    return;
                }
                button.cloneInto(menuContainer);
            });
        };
        api.reset = function () {
            initButtons();
            getMenu().draggable({
                stop: function () {
                    var menu = $(this);
                    var topOff = menu.offset().top - $(window).scrollTop();
                    menu.css("top", topOff);
                    menu.css("position", "fixed")
                }
            }).tooltip();
            function initButtons() {
                api.visitButtons(function (button) {
                    setIcon(button);
                    applyActionOnClick(button);
                    defineTooltip(button);
                });
                function setIcon(button) {
                    $("<i>").addClass(
                            "fa " + button.getIconClass()
                    ).appendTo(button.getHtml());
                }

                function applyActionOnClick(button) {
                    button.getHtml().on(
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
                }

                function defineTooltip(button) {
                    button.getHtml().attr(
                        "data-toggle", "tooltip"
                    ).attr(
                        "title",
                        $.i18n.translate("menu-button." + button.getAction())
                    );
                }
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
        api.onlyShowButtonsIfApplicable = function(clickHandler, graphElement){
            api.visitButtons(function (button) {
                button.showOnlyIfApplicable(
                    clickHandler,
                    graphElement
                );
            });
        };
        EventBus.subscribe("/event/ui/selection/changed", selectionChangedHandler);
        EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function(){
            if(!MindMapInfo.isCenterBubbleUriDefinedInUrl()){
                getMenu().addClass("hidden");
            }
        });
        return api;

        function selectionChangedHandler(event, selectionInfo) {
            var clickHandler = updateCurrentClickHandler(selectionInfo);
            if (undefined === clickHandler) {
                return;
            }
            var selected = 1 === selectionInfo.getNbSelected() ?
                selectionInfo.getSingleElement() :
                selectionInfo.getSelectedElements();
            api.onlyShowButtonsIfApplicable(
                clickHandler,
                selected
            );
        }

        function getButtonsHtml() {
            return getMenu().find("> button");
        }

        function getMenu() {
            if (!_menu) {
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
                currentClickHandler = selectedElements.getSingleElement().getMenuHandler().forSingle();
            } else {
                var nbSelectedVertices = selectedElements.getNbSelectedVertices(),
                    nbSelectedRelations = selectedElements.getNbSelectedRelations(),
                    nbSelectedGroupRelations = selectedElements.getNbSelectedGroupRelations();
                if (0 === nbSelectedVertices && 0 === nbSelectedGroupRelations) {
                    currentClickHandler = relationMenuHandler.forGroup();
                } else if (0 === nbSelectedRelations && 0 === nbSelectedGroupRelations) {
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
    }
);