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
        "mr.app_controller",
        "jquery.i18next",
        "bootstrap"
    ], function ($, GraphDisplayer, EventBus, SelectionHandler, GraphElementButton, MindMapInfo, AppController) {
        "use strict";
        var api = {},
            _menu;
        api.addRelevantButtonsInMenu = function (menuContainer, controller) {
            api.visitButtons(function (button) {
                if (!button.canActionBePossiblyMade(controller)) {
                    return;
                }
                var clone = button.cloneInto(menuContainer);
                api.applyActionOnClick(
                    clone
                );
                api.defineTooltip(
                    clone
                );
            });
        };
        api.reset = function () {
            initButtons();
            function initButtons() {
                api.visitButtons(function (button) {
                    setIcon(button);
                    api.applyActionOnClick(button);
                    setTitle(button);
                    api.defineTooltip(button);
                });
                function setIcon(button) {
                    var icon = $("<i>").addClass(
                        "fa " + button.getIconClass()
                    );
                    if (button.getHtml().hasClass("icon-flip-horizontal")) {
                        icon.addClass(
                            "fa-flip-vertical"
                        );
                    }
                    icon.appendTo(button.getHtml());
                }
                function setTitle(button){
                    button.getHtml().attr(
                        "title",
                        $.i18n.translate("menu-button." + button.getAction())
                    );
                }
            }
        };
        api.applyActionOnClick = function (button) {
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
                            ]();
                    }
                    api.reviewButtonsVisibility();
                }
            );
        };
        api.defineTooltip = function(button) {
            preventNativeTooltip();
            button.getHtml().popoverLikeToolTip();
            function preventNativeTooltip(){
                button.getHtml().hover(
                    function(event) {
                        event.preventDefault();
                    }
                );
            }
        };
        api.getExpandAllButton = function () {
            return api._getButtonHavingAction(
                "expandAll"
            );
        };

        api._getButtonHavingAction = function (action) {
            return GraphElementButton.fromHtml(
                api._getMenu().find(
                    "button[data-action=" + action + "]"
                )
            );
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
                if (button.isForWholeGraph()) {
                    api.showWholeGraphButtonOnlyIfApplicable(
                        button
                    );
                    return;
                }
                if (button.isForApp()) {
                    api.showAppButtonOnlyIfApplicable(
                        button
                    );
                    return;
                }
                button.showOnlyIfApplicable(
                    controller,
                    graphElement
                );
            });
        };

        api.showWholeGraphButtonOnlyIfApplicable = function (button) {
            button.showOnlyIfApplicable(
                GraphDisplayer.getGraphMenuHandler()
            );
        };

        api.showAppButtonOnlyIfApplicable = function (button) {
            button.showOnlyIfApplicable(
                AppController
            );
        };

        api.reviewButtonsVisibility = function () {
            var selectionInfo = SelectionHandler.getSelectionInfo();
            var controller = updateCurrentClickHandler(selectionInfo);
            var selected = 1 === selectionInfo.getNbSelected() ?
                selectionInfo.getSingleElement() :
                selectionInfo.getSelectedElements();
            api.onlyShowButtonsIfApplicable(
                controller,
                selected
            );
        };

        api._getCurrentClickHandler = function (button) {
            if (button !== undefined) {
                if (button.isForWholeGraph()) {
                    return GraphDisplayer.getGraphMenuHandler();
                }
                if (button.isForApp()) {
                    return AppController;
                }
            }

            return api._currentClickHandler;
        };

        api._getMenu = function () {
            if (!_menu || _menu.length === 0) {
                _menu = $("#graph-element-menu");
            }
            return _menu;
        };

        EventBus.subscribe("/event/ui/selection/changed", api.reviewButtonsVisibility);
        EventBus.subscribe('/event/ui/graph/vertex/suggestions/updated', api.reviewButtonsVisibility);
        EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function () {
            if (!MindMapInfo.isCenterBubbleUriDefinedInUrl()) {
                api._getMenu().addClass("hidden");
            }
        });

        return api;

        function getButtonsHtml() {
            return api._getMenu().find("> button");
        }

        function updateCurrentClickHandler(selectionInfo) {
            var nbSelectedGraphElements = selectionInfo.getNbSelected(),
                currentClickHandler,
                object;
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
                    object = GraphDisplayer.getRelationMenuHandler();
                    currentClickHandler = new object.RelationController(
                        selectionInfo.getSelectedElements()
                    );
                } else if (0 === nbSelectedRelations && 0 === nbSelectedGroupRelations) {
                    object = GraphDisplayer.getVertexMenuHandler();
                    currentClickHandler = new object.VertexController(
                        selectionInfo.getSelectedElements()
                    );
                } else {
                    object = GraphDisplayer.getGraphElementMenuHandler();
                    currentClickHandler = new object.GraphElementController(
                        selectionInfo.getSelectedElements()
                    );
                }
            }
            setCurrentClickHandler(
                currentClickHandler
            );
            return currentClickHandler;
        }

        function setCurrentClickHandler(currentClickHandler) {
            api._currentClickHandler = currentClickHandler;
        }
    }
);