/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.relative_tree_center_vertex",
    "triple_brain.selection_handler",
    "triple_brain.vertex_service",
    "triple_brain.ui.utils",
    "triple_brain.ui.identification_menu",
    "triple_brain.graph_displayer",
    "triple_brain.mind_map_info"
], function ($, EventBus, RelativeTreeCenterVertex, SelectionHandler, VertexService, UiUtils, IdentificationMenu, GraphDisplayer, MindMapInfo) {
    "use strict";
    var api = {},
        tabKeyNumber = 9,
        leftArrowKeyNumber = 37,
        rightArrowKeyNumber = 39,
        upArrowKeyNumber = 38,
        downArrowKeyNumber = 40,
        iArrowKeyNumber = 73,
        listenedKeysAndTheirAction = defineListenedKeysAndTheirActions();
    api.init = function () {
        EventBus.subscribe(
            "/event/ui/graph/drawing_info/updated/",
            handleKeyboardActions
        );
    };
    api.disable = function(){

    };
    api.enable = function(){

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
        if (isThereASpecialKeyPressed()) {
            return;
        }
        if (!SelectionHandler.isOnlyASingleElementSelected()) {
            return;
        }
        if($('input:focus').length){
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
            ]
        ];
    }
    function iAction(selectedElement) {
        if (MindMapInfo.isViewOnly() || selectedElement.isGroupRelation()) {
            return;
        }
        IdentificationMenu.ofGraphElement(
            selectedElement
        ).create();
    }

    function tabAction(selectedElement) {
        if (MindMapInfo.isViewOnly() || selectedElement.isRelation() || selectedElement.isProperty()) {
            return;
        }
        selectedElement.getMenuHandler().forSingle().addChildAction(selectedElement);
    }

    function leftAction(selectedElement) {
        if (selectedElement.isRelation()) {
            applyPressedArrowActionOnRelation(selectedElement);
            return;
        }
        var newSelectedBubble;
        if (isCenterVertex(selectedElement)) {
            var centerVertex = RelativeTreeCenterVertex.usingVertex(
                selectedElement
            );
            if (!centerVertex.hasChildToLeft()) {
                return;
            }
            newSelectedBubble = centerVertex.getToTheLeftTopMostChild();
        } else if (selectedElement.isToTheLeft()) {
            if (!selectedElement.hasChildren()) {
                return;
            }
            newSelectedBubble = selectedElement.getTopMostChild();
        } else {
            newSelectedBubble = selectedElement.getParentBubble();
        }
        SelectionHandler.setToSingleGraphElement(newSelectedBubble);
        centerBubbleIfApplicable(newSelectedBubble);
    }

    function rightAction(selectedElement) {
        if (selectedElement.isRelation()) {
            applyPressedArrowActionOnRelation(selectedElement);
            return;
        }
        var newSelectedBubble;
        if (isCenterVertex(selectedElement)) {
            var centerVertex = RelativeTreeCenterVertex.usingVertex(
                selectedElement
            );
            if (!centerVertex.hasChildToRight()) {
                return;
            }
            newSelectedBubble = centerVertex.getToTheRightTopMostChild();
        } else if (selectedElement.isToTheLeft()) {
            newSelectedBubble = selectedElement.getParentBubble();
        } else {
            if (!selectedElement.hasChildren()) {
                return;
            }
            newSelectedBubble = selectedElement.getTopMostChild();
        }
        SelectionHandler.setToSingleGraphElement(newSelectedBubble);
        centerBubbleIfApplicable(newSelectedBubble);
    }

    function upAction(selectedElement) {
        if (selectedElement.isRelation()) {
            applyPressedArrowActionOnRelation(selectedElement);
            return;
        }
        if (isCenterVertex(selectedElement) || !selectedElement.hasBubbleAbove()) {
            return;
        }
        var bubbleAbove = selectedElement.getBubbleAbove();
        SelectionHandler.setToSingleGraphElement(bubbleAbove);
        centerBubbleIfApplicable(bubbleAbove);
    }

    function downAction(selectedElement) {
        if (selectedElement.isRelation()) {
            applyPressedArrowActionOnRelation(selectedElement);
            return;
        }
        if (isCenterVertex(selectedElement) || !selectedElement.hasBubbleUnder()) {
            return;
        }
        var bubbleUnder = selectedElement.getBubbleUnder();
        SelectionHandler.setToSingleGraphElement(bubbleUnder);
        centerBubbleIfApplicable(bubbleUnder);
    }

    function applyPressedArrowActionOnRelation(relation){
        SelectionHandler.setToSingleVertex(
            relation.childVertexInDisplay()
        );
    }

    function centerBubbleIfApplicable(bubble) {
        var html = bubble.getHtml();
        if (!UiUtils.isElementFullyOnScreen(html)) {
            html.centerOnScreenWithAnimation();
        }
    }

    function isCenterVertex(selectedElement){
        return selectedElement.isSchema() || (
            selectedElement.isVertex() && selectedElement.isCenterVertex()
            );
    }
});