/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.selection_handler",
    "triple_brain.center_bubble",
    "triple_brain.vertex_service",
    "triple_brain.ui.utils",
    "triple_brain.identification_menu",
    "triple_brain.mind_map_info",
    "triple_brain.graph_element_ui"
], function ($, EventBus, SelectionHandler, CenterBubble, VertexService, UiUtils, IdentificationMenu, MindMapInfo, GraphElementUi) {
    "use strict";
    var api = {},
        tabKeyNumber = 9,
        leftArrowKeyNumber = 37,
        rightArrowKeyNumber = 39,
        upArrowKeyNumber = 38,
        downArrowKeyNumber = 40,
        iArrowKeyNumber = 73,
        enterKeyNumber = 13,
        deleteKeyNumber = 46,
        spaceBarKeyNumber = 32,
        escapeKeyNumber = 27,
        eKeyNumber = 69,
        sKeyNumber = 83,
        rKeyNumber = 82,
        listenedKeysAndTheirAction = defineListenedKeysAndTheirActions();
    api.init = function () {
        EventBus.subscribe(
            "/event/ui/graph/drawing_info/updated/",
            api._handleKeyboardActions
        );
    };
    api._handleKeyboardActions = function () {
        $(window).off(
            "keydown", keyDownHandler
        ).on(
            "keydown", keyDownHandler
        );
    };
    return api;

    function keyDownHandler(event) {
        var target = $(event.target),
            isWorkingOnSomething = !target.is("body");
        if (isWorkingOnSomething) {
            if (event.keyCode === escapeKeyNumber) {
                target.blur();
            }
            return;
        }
        if (isThereASpecialKeyPressed()) {
            return;
        }
        if (!SelectionHandler.isOnlyASingleElementSelected()) {
            return;
        }
        var selectedElement = SelectionHandler.getSingleElement();
        var action = listenedKeysAndTheirAction[event.which];
        if(action === undefined){
            return;
        }
        event.preventDefault();
        action(selectedElement);
        function isThereASpecialKeyPressed() {
            return event.altKey || event.ctrlKey || event.metaKey;
        }
    }

    function defineListenedKeysAndTheirActions() {
        var actions = {};
        actions[tabKeyNumber] = tabAction;
        actions[leftArrowKeyNumber] = leftAction;
        actions[rightArrowKeyNumber] = rightAction;
        actions[upArrowKeyNumber] = upAction;
        actions[downArrowKeyNumber] = downAction;
        actions[iArrowKeyNumber] = iAction;
        actions[spaceBarKeyNumber] = spacebarAction;
        actions[eKeyNumber] = eKeyAction;
        actions[sKeyNumber] = sKeyAction;
        actions[rKeyNumber] = rKeyAction;
        actions[deleteKeyNumber] = deleteKeyAction;
        return actions;
    }

    function iAction(selectedElement) {
        if (MindMapInfo.isViewOnly() || selectedElement.isGroupRelation() || selectedElement.isSchema()) {
            return;
        }
        IdentificationMenu.ofGraphElement(
            selectedElement
        ).create();
    }

    function spacebarAction(selectedElement) {
        if (MindMapInfo.isViewOnly() || selectedElement.isGroupRelation()) {
            return;
        }
        selectedElement.focus();
    }

    function eKeyAction(selectedElement) {
        if (!selectedElement.isInTypes([
                GraphElementUi.Types.GroupRelation,
                GraphElementUi.Types.Vertex
            ])) {
            return;
        }
        if (selectedElement.hasHiddenRelationsContainer()) {
            selectedElement.addChildTree();
        }
    }

    function sKeyAction(selectedElement) {
        if (!selectedElement.isVertex()) {
            return;
        }
        var handler = selectedElement.getMenuHandler().forSingle();
        if (handler.suggestionsCanDo(selectedElement)) {
            handler.suggestionsAction(
                selectedElement
            );
        }
    }

    function rKeyAction(selectedElement) {
        if (!selectedElement.isRelation()) {
            return;
        }
        selectedElement.getMenuHandler().forSingle().reverse(
            selectedElement
        );
    }

    function tabAction(selectedElement) {
        if (MindMapInfo.isViewOnly() || selectedElement.isRelation() || selectedElement.isProperty()) {
            return;
        }
        selectedElement.getMenuHandler().forSingle().addChildAction(selectedElement);
    }

    function leftAction(selectedElement) {
        if (selectedElement.isCenterBubble()) {
            var centerVertex = CenterBubble.usingBubble(
                selectedElement
            );
            if (!centerVertex.hasChildToLeft()) {
                return;
            }
            return selectNew(
                centerVertex.getToTheLeftTopMostChild()
            );
        }
        return selectNew(
            selectedElement.isToTheLeft() ?
                selectedElement.getTopMostChildBubble() :
                selectedElement.getParentBubble()
        );
    }

    function rightAction(selectedElement) {
        if (selectedElement.isCenterBubble()) {
            var centerVertex = CenterBubble.usingBubble(
                selectedElement
            );
            if (!centerVertex.hasChildToRight()) {
                return;
            }
            return selectNew(
                centerVertex.getToTheRightTopMostChild()
            );
        }
        return selectNew(
            selectedElement.isToTheLeft() ?
                selectedElement.getParentBubble() :
                selectedElement.getTopMostChildBubble()
        );
    }

    function upAction(selectedElement) {
        selectNew(
            selectedElement.getBubbleAbove()
        );
    }

    function downAction(selectedElement) {
        selectNew(
            selectedElement.getBubbleUnder()
        );
    }

    function centerBubbleIfApplicable(bubble) {
        var html = bubble.getHtml();
        if (!UiUtils.isElementFullyOnScreen(html)) {
            html.centerOnScreenWithAnimation();
        }
    }

    function selectNew(newSelectedElement) {
        SelectionHandler.setToSingleGraphElement(newSelectedElement);
        centerBubbleIfApplicable(newSelectedElement);
    }

    function deleteKeyAction(selectedElement) {
        if (MindMapInfo.isViewOnly()) {
            return;
        }
        selectedElement.getMenuHandler().forSingle().removeAction(
            selectedElement
        );
    }
});