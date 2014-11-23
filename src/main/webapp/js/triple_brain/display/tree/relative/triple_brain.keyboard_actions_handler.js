/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
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
        escapeKeyNumber = 27,
        eKeyNumber = 69,
        sKeyNumber = 83,
        listenedKeysAndTheirAction = defineListenedKeysAndTheirActions();
    api.init = function () {
        EventBus.subscribe(
            "/event/ui/graph/drawing_info/updated/",
            handleKeyboardActions
        );
    };
    return api;
    function handleKeyboardActions() {
        $(window).off(
            "keydown", keyDownHanlder
        ).on(
            "keydown", keyDownHanlder
        );
    }

    function keyDownHanlder(event) {
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
        $.each(listenedKeysAndTheirAction, function () {
            var key = this[0];
            if (event.which !== key) {
                return;
            }
            event.preventDefault();
            var action = this[1];
            action(selectedElement);
            return false;
        });
        function isThereASpecialKeyPressed() {
            return event.altKey || event.ctrlKey || event.metaKey;
        }
    }

    function defineListenedKeysAndTheirActions() {
        return [
            [
                tabKeyNumber, tabAction
            ],
            [
                leftArrowKeyNumber, leftAction
            ],
            [
                rightArrowKeyNumber, rightAction
            ],
            [
                upArrowKeyNumber, upAction
            ],
            [
                downArrowKeyNumber, downAction
            ],
            [
                iArrowKeyNumber, iAction
            ],
            [
                enterKeyNumber, enterKeyAction
            ],
            [
                eKeyNumber, eKeyAction
            ],
            [
                sKeyNumber, sKeyAction
            ]
        ];
    }

    function iAction(selectedElement) {
        if (MindMapInfo.isViewOnly() || selectedElement.isGroupRelation() || selectedElement.isSchema()) {
            return;
        }
        IdentificationMenu.ofGraphElement(
            selectedElement
        ).create();
    }

    function enterKeyAction(selectedElement) {
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

    function downAction(selectedElement){
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
});