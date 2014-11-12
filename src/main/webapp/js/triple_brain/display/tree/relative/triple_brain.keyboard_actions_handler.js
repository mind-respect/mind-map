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
            selectedElement.removeHiddenRelationsContainer();
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
        selectedElement.rightActionForType(
            leftActionForVertex,
            leftActionForRelation,
            leftActionOther,
            leftActionForSchema,
            leftActionOther,
            leftActionOther,
            leftActionOther
        )(selectedElement);
    }

    function leftActionForSchema(schema) {
        var centerVertex = CenterBubble.usingBubble(
            schema
        );
        selectNew(
            centerVertex.getToTheLeftTopMostChild()
        );
    }

    function leftActionForVertex(vertex) {
        var newSelectedElement;
        if (isCenterVertex(vertex)) {
            var centerVertex = CenterBubble.usingBubble(
                vertex
            );
            if (!centerVertex.hasChildToLeft()) {
                return;
            }
            newSelectedElement = getRelationOrBubble(
                centerVertex.getToTheLeftTopMostChild()
            );
        } else if (vertex.isToTheLeft()) {
            if (!vertex.hasChildren()) {
                return;
            }
            newSelectedElement = getRelationOrBubble(
                vertex.getTopMostChildBubble()
            );
        } else {
            newSelectedElement = vertex.getRelationWithParent();
        }
        selectNew(newSelectedElement);
    }

    function leftActionForRelation(relation) {
        var childVertexInDisplay = relation.childVertexInDisplay();
        var newSelectedGraphElement = childVertexInDisplay.isToTheLeft() ?
            childVertexInDisplay :
            childVertexInDisplay.getParentBubble();
        selectNew(newSelectedGraphElement);
    }

    function leftActionOther(selectedElement) {
        var newSelectedElement;
        if (selectedElement.isToTheLeft()) {
            if (!selectedElement.hasChildren()) {
                return;
            }
            newSelectedElement = getRelationOrBubble(
                selectedElement.getTopMostChildBubble()
            );
        } else {
            newSelectedElement = selectedElement.getParentBubble();
        }
        selectNew(newSelectedElement);
    }


    function rightAction(selectedElement) {
        var newSelectedGraphElement;
        if (selectedElement.isRelation()) {
            var childVertexInDisplay = selectedElement.childVertexInDisplay();
            newSelectedGraphElement = childVertexInDisplay.isToTheLeft() ?
                childVertexInDisplay.getParentBubble() :
                childVertexInDisplay;
        }
        else if (isCenterVertex(selectedElement)) {
            var centerVertex = CenterBubble.usingBubble(
                selectedElement
            );
            if (!centerVertex.hasChildToRight()) {
                return;
            }
            newSelectedGraphElement = centerVertex.getToTheRightTopMostChild().getRelationWithParent();
        } else if (selectedElement.isToTheLeft()) {
            newSelectedGraphElement = selectedElement.getParentBubble();
        } else {
            if (!selectedElement.hasChildren()) {
                return;
            }
            newSelectedGraphElement = selectedElement.getTopMostChildBubble();
        }
        SelectionHandler.setToSingleGraphElement(newSelectedGraphElement);
        centerBubbleIfApplicable(newSelectedGraphElement);
    }

    function upAction(selectedElement) {
        if (selectedElement.isRelationOrSuggestion()) {
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
        if (selectedElement.isRelationOrSuggestion()) {
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

    function applyPressedArrowActionOnRelation(relation) {
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

    function isCenterVertex(selectedElement) {
        return selectedElement.isSchema() || (
            selectedElement.isVertex() && selectedElement.isCenterVertex()
            );
    }

    function getRelationOrBubble(element) {
        return element.isGroupRelation() ? element : element.getRelationWithParent();
    }

    function selectNew(newSelectedElement) {
        SelectionHandler.setToSingleGraphElement(newSelectedElement);
        centerBubbleIfApplicable(newSelectedElement);
    }
});