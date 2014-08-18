/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.relative_tree_center_vertex",
    "triple_brain.selection_handler",
    "triple_brain.vertex",
    "triple_brain.ui.utils",
    "triple_brain.ui.identification_menu",
    "triple_brain.graph_displayer"
], function ($, EventBus, RelativeTreeCenterVertex, SelectionHandler, VertexService, UiUtils, IdentificationMenu, GraphDisplayer) {
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
        if (selectedElement.isGroupRelation()) {
            return;
        }
        IdentificationMenu.ofGraphElement(
            selectedElement
        ).create();
    }


    function tabAction(selectedElement) {
        if (selectedElement.isRelation()) {
            return;
        }
        var menuHandler = selectedElement.isVertex() ?
            GraphDisplayer.getVertexMenuHandler() :
            GraphDisplayer.getGroupRelationMenuHandler();
        menuHandler.forSingle.addChildAction(selectedElement);
    }

    function leftAction(selectedElement) {
        if (selectedElement.isRelation()) {
            return;
        }
        var newSelectedBubble,
            isCenterVertex = selectedElement.isVertex() && selectedElement.isCenterVertex();
        if (isCenterVertex) {
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
        if (newSelectedBubble.isVertex()) {
            SelectionHandler.setToSingleVertex(newSelectedBubble);
            centerVertexIfApplicable(newSelectedBubble);
        } else {
            SelectionHandler.setToSingleGroupRelation(newSelectedBubble);
        }

    }

    function rightAction(selectedElement) {
        if (selectedElement.isRelation()) {
            return;
        }
        var newSelectedBubble,
            isCenterVertex = selectedElement.isVertex() && selectedElement.isCenterVertex();
        if (isCenterVertex) {
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
        if (newSelectedBubble.isVertex()) {
            SelectionHandler.setToSingleVertex(newSelectedBubble);
            centerVertexIfApplicable(newSelectedBubble);
        } else {
            SelectionHandler.setToSingleGroupRelation(newSelectedBubble);
        }
    }

    function upAction(selectedElement) {
        if (selectedElement.isRelation()) {
            return;
        }
        var isCenterVertex = selectedElement.isVertex() && selectedElement.isCenterVertex();
        if (isCenterVertex || !selectedElement.hasBubbleAbove()) {
            return;
        }
        var bubbleAbove = selectedElement.getBubbleAbove();
        if (bubbleAbove.isVertex()) {
            SelectionHandler.setToSingleVertex(bubbleAbove);
            centerVertexIfApplicable(bubbleAbove);
        } else {
            SelectionHandler.setToSingleGroupRelation(bubbleAbove);
        }

    }

    function downAction(selectedElement) {
        if (selectedElement.isRelation()) {
            return;
        }
        var isCenterVertex = selectedElement.isVertex() && selectedElement.isCenterVertex();
        if (isCenterVertex || !selectedElement.hasBubbleUnder()) {
            return;
        }
        var bubbleUnder = selectedElement.getBubbleUnder();
        if (bubbleUnder.isVertex()) {
            SelectionHandler.setToSingleVertex(bubbleUnder);
            centerVertexIfApplicable(bubbleUnder);
        } else {
            SelectionHandler.setToSingleGroupRelation(bubbleUnder);
        }
    }

    function centerVertexIfApplicable(vertex) {
        var html = vertex.getHtml();
        if (!UiUtils.isElementFullyOnScreen(html)) {
            html.centerOnScreenWithAnimation();
        }
    }
});