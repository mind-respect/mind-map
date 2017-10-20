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
        "triple_brain.ui_utils",
        "mr.app_controller",
        "jquery.i18next",
        "bootstrap"
    ], function ($, GraphDisplayer, EventBus, SelectionHandler, GraphElementButton, MindMapInfo, UiUtils, AppController) {
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
                    icon.addClass(
                        button.getAdditionalClasses()
                    );
                    if (button.getHtml().hasClass("icon-flip-horizontal")) {
                        icon.addClass(
                            "fa-flip-vertical"
                        );
                    }
                    icon.appendTo(button.getHtml());
                }

                function setTitle(button) {
                    var title = $.i18n.translate("menu-button." + button.getAction());

                    if (button.hasCombinedKeyShortcut()) {
                        title += UiUtils.isMacintosh() ? " (⌘" : " (ctrl+";
                        title += button.getCombinedKeyShortcut() + ")";
                    }
                    button.getHtml().attr(
                        "title", title
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
                    controller[
                        button.getAction()
                        ]();
                    api.reviewButtonsVisibility();
                }
            );
        };
        api.defineTooltip = function (button) {
            preventNativeTooltip();
            button.getHtml().popoverLikeToolTip();
            function preventNativeTooltip() {
                button.getHtml().hover(
                    function (event) {
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
                }
                if (button.isForApp()) {
                    api.showAppButtonOnlyIfApplicable(
                        button
                    );
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
            var controller = updateCurrentClickHandler();
            var selected = 1 === SelectionHandler.getNbSelected() ?
                SelectionHandler.getSingleElement() :
                SelectionHandler.getSelectedElements();
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

        api.getControllerFromCurrentSelection = function(){
            var nbSelectedGraphElements = SelectionHandler.getNbSelected();
            var currentController;
            if (0 === nbSelectedGraphElements) {
                currentController = GraphDisplayer.getGraphMenuHandler();
            }else if (1 === nbSelectedGraphElements) {
                currentController = SelectionHandler.getSingleElement().getController();
            } else {
                var anyElement = SelectionHandler.getSingleElement();
                var anyElementType = anyElement.getGraphElementType();
                var areAllElementsOfSameType = true;
                SelectionHandler.getSelectedElements().forEach(function (selectedElement) {
                    if (selectedElement.getGraphElementType() !== anyElementType) {
                        areAllElementsOfSameType = false;
                    }
                });
                var graphElementControllerClass = GraphDisplayer.getGraphElementMenuHandler();
                currentController = areAllElementsOfSameType ? anyElement.getControllerWithElements(
                    SelectionHandler.getSelectedElements()
                ) : new graphElementControllerClass.GraphElementController(
                    SelectionHandler.getSelectedElements()
                );
            }
            return currentController;
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

        function updateCurrentClickHandler() {
            var currentClickHandler = api.getControllerFromCurrentSelection();
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