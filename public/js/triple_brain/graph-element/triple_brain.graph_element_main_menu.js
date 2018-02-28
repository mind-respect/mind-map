/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.graph_displayer",
        "triple_brain.event_bus",
        "triple_brain.graph_element_button",
        "triple_brain.mind_map_info",
        "triple_brain.ui_utils",
        "mr.app_controller",
        "jquery.i18next",
        "bootstrap"
    ], function ($, GraphDisplayer, EventBus, GraphElementButton, MindMapInfo, UiUtils, AppController) {
        "use strict";
        var api = {},
            _graphElementMenu,
            _graphMenu,
            _possibleInLabelMenu;
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
            }, false, getGraphElementButtons());
        };
        api.reset = function () {
            initButtons();

            function initButtons() {
                api.visitButtons(function (button) {
                    api.applyActionOnClick(button);
                    setTitle(button);
                    api.defineTooltip(button);
                });

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
                    if(button.isDisabled()){
                        return;
                    }
                    var isInBubble = button.isInBubble();
                    var controller = isInBubble ?
                        button.getParentBubble().getController() :
                        api._getCurrentClickHandler(button);
                    controller[
                        button.getAction()
                        ]();
                    api.reviewButtonsVisibility(controller.getUi(), controller);
                }
            );
        };
        api.defineTooltip = function (button, options) {
            preventNativeTooltip();
            button.getHtml().popoverLikeToolTip(options);

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
                api._getGraphElementMenu().find(
                    "button[data-action=" + action + "]"
                )
            );
        };
        api.visitGraphElementButtons = function (visitor, inverse) {
            return api.visitButtons(
                visitor,
                inverse,
                getGraphElementButtons()
            );
        };
        api.visitInLabelPossibleButtons = function (visitor, inverse) {
            return api.visitButtons(
                visitor,
                inverse,
                getInLabelPossibleButtons()
            );
        };
        api.visitButtons = function (visitor, inverse, buttonsHtml) {
            buttonsHtml = buttonsHtml || getButtonsHtml();
            if (inverse) {
                buttonsHtml = $(buttonsHtml.get().reverse());
            }
            buttonsHtml.each(function () {
                visitor(
                    GraphElementButton.fromHtml(
                        $(this)
                    )
                );
            });
        };

        api.onlyShowButtonsIfApplicable = function (controller, graphElement, buttonsHtml) {
            api.visitButtons(function (button) {
                if (button.isForWholeGraph()) {
                    return api.showWholeGraphButtonOnlyIfApplicable(
                        button
                    );
                }
                if (button.isForApp()) {
                    return api.showAppButtonOnlyIfApplicable(
                        button
                    );
                }
                button.showOnlyIfApplicable(
                    controller,
                    graphElement
                );
            }, false, buttonsHtml);
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

        api.reviewButtonsVisibility = function (bubbles, controller) {
            controller = controller || api._currentController;
            bubbles = bubbles || controller.getUi();
            api.reviewOutOfBubbleButtonsDisplay(bubbles, controller);
            api.reviewInBubbleButtonsDisplay(bubbles, controller);
            api.reviewAppButtonsDisplay();
        };

        api.reviewOutOfBubbleButtonsDisplay = function (bubbles, controller) {
            api._currentController = controller;
            api.onlyShowButtonsIfApplicable(
                controller,
                bubbles,
                getGraphElementButtons()
            );
        };

        api.reviewInBubbleButtonsDisplay = function (bubbles, controller) {
            api._currentController = controller;
            api.onlyShowButtonsIfApplicable(
                controller,
                bubbles
            );
        };

        api.reviewAppButtonsDisplay = function () {
            api.onlyShowButtonsIfApplicable(
                GraphDisplayer.getGraphMenuHandler(),
                [],
                getGraphButtons()
            );
        };

        api._getCurrentClickHandler = function (button) {
            if (button.isForWholeGraph()) {
                return GraphDisplayer.getGraphMenuHandler();
            }
            if (button.isForApp()) {
                return AppController;
            }
            return api._currentController;
        };

        api._getGraphElementMenu = function () {
            if (!_graphElementMenu || _graphElementMenu.length === 0) {
                _graphElementMenu = $("#graph-element-menu");
            }
            return _graphElementMenu;
        };

        api._getGraphMenu = function () {
            if (!_graphMenu || _graphMenu.length === 0) {
                _graphMenu = $("#graph-menu");
            }
            return _graphMenu;
        };

        api._getPossibleInLabelMenu = function () {
            if (!_possibleInLabelMenu || _possibleInLabelMenu.length === 0) {
                _possibleInLabelMenu = $("#in-label-btns");
            }
            return _possibleInLabelMenu;
        };

        EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function () {
            if (!MindMapInfo.isCenterBubbleUriDefinedInUrl()) {
                api._getGraphElementMenu().addClass("hidden");
            }
        });

        return api;

        function getButtonsHtml() {
            return api._getGraphElementMenu().add(
                api._getGraphMenu()
            ).find("button");
        }

        function getGraphElementButtons() {
            return api._getGraphElementMenu().find("button");
        }

        function getGraphButtons() {
            return api._getGraphMenu().find("button");
        }

        function getInLabelPossibleButtons(){
            return api._getPossibleInLabelMenu().find("button");
        }
    }
);