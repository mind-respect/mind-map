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
        api.addRelevantButtonsInMenu = function (menuContainer, controller) {
            api.visitButtons(function (button) {
                if (!button.canActionBePossiblyMade(controller)) {
                    return;
                }
                button.cloneInto(menuContainer);
            });
        };
        api.reset = function () {
            initButtons();
            api._getMenu().draggable({
                stop: function () {
                    var menu = $(this);
                    var topOff = menu.offset().top - $(window).scrollTop();
                    menu.css(
                        "top", topOff
                    ).css(
                        "position",
                        "fixed"
                    );
                }
            }).tooltip({
                delay: {"show": 0, "hide": 0}
            });
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
                            var button = GraphElementButton.fromHtml(
                                $(this)
                            );
                            var isInBubble = button.isInBubble();
                            var graphElements = isInBubble ?
                                button.getParentBubble() :
                                SelectionHandler.getOneOrArrayOfSelected();

                            var controller = isInBubble ?
                                graphElements.getController() :
                                api._getCurrentClickHandler(button);
                            var clickHandler = controller[
                            button.getAction() + "BtnClick"
                                ];
                            if (clickHandler) {
                                clickHandler.call(
                                    controller,
                                    event,
                                    graphElements
                                );
                            } else {
                                controller[
                                    button.getAction()
                                    ](
                                    graphElements
                                );
                            }
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

        api.onlyShowButtonsIfApplicable = function (controller, graphElement) {
            api.visitButtons(function (button) {
                button.showOnlyIfApplicable(
                    controller,
                    graphElement
                );
            });
        };
        EventBus.subscribe("/event/ui/selection/changed", reviewButtonsVisibility);
        EventBus.subscribe('/event/ui/graph/vertex/suggestions/updated', reviewButtonsVisibility);
        EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function () {
            if (!MindMapInfo.isCenterBubbleUriDefinedInUrl()) {
                api._getMenu().addClass("hidden");
            }
        });

        api._getCurrentClickHandler = function (button) {
            if (button.isForWholeGraph()) {
                return GraphDisplayer.getGraphMenuHandler();
            }
            return api._getMenu().data(
                "currentClickHandler"
            );
        };

        api._getMenu = function () {
            if (!_menu || _menu.length === 0) {
                _menu = $("#graph-element-menu");
            }
            return _menu;
        };

        return api;

        function reviewButtonsVisibility() {
            var selectionInfo = SelectionHandler.getSelectionInfo();
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
            return api._getMenu().find("> button");
        }

        function updateCurrentClickHandler(selectionInfo) {
            var nbSelectedGraphElements = selectionInfo.getNbSelected(),
                currentClickHandler,
                vertexMenuHandler = GraphDisplayer.getVertexMenuHandler(),
                relationMenuHandler = GraphDisplayer.getRelationMenuHandler();
            if (0 === nbSelectedGraphElements) {
                currentClickHandler = GraphDisplayer.getGraphMenuHandler();
            }
            else if (1 === nbSelectedGraphElements) {
                currentClickHandler = selectionInfo.getSingleElement().getController();
            } else {
                var nbSelectedVertices = selectionInfo.getNbSelectedVertices(),
                    nbSelectedRelations = selectionInfo.getNbSelectedRelations(),
                    nbSelectedGroupRelations = selectionInfo.getNbSelectedGroupRelations();
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
            api._getMenu().data(
                "currentClickHandler",
                currentClickHandler
            );
        }
    }
);