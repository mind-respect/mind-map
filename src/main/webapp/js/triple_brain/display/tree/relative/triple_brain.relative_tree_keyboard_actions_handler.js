/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.relative_tree_center_vertex",
    "triple_brain.selection_handler",
    "triple_brain.vertex",
    "triple_brain.relative_tree_vertex",
    "triple_brain.ui.edge",
    "triple_brain.ui.utils"
], function ($, EventBus, RelativeTreeCenterVertex, SelectionHandler, VertexService, RelativeTreeVertex, EdgeUi, UiUtils) {
    "use strict";
    var api = {},
        tabKeyNumber = 9,
        leftArrowKeyNumber = 37,
        rightArrowKeyNumber = 39,
        upArrowKeyNumber = 38,
        downArrowKeyNumber = 40,
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
            "keydown",keyDownHanlder
        ).on(
            "keydown", keyDownHanlder
        );
    }
    function keyDownHanlder(event){
        if (isThereASpecialKeyPressed()) {
            return;
        }
        if (!SelectionHandler.isOnlyASingleBubbleSelected()) {
            return;
        }
        var selectedBubble = SelectionHandler.getSelectedBubbles()[0];
        $.each(listenedKeysAndTheirAction, function () {
            var key = this[0];
            if (event.which !== key) {
                return;
            }
            event.preventDefault();
            var action = this[1];
            action(selectedBubble);
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
            ]
        ];
    }

    function tabAction(selectedVertex) {
        VertexService.addRelationAndVertexToVertex(
            selectedVertex, function(triple){
                if(selectedVertex.hasHiddenRelationsContainer()){
                    selectedVertex.getHiddenRelationsContainer().remove();
                }
                var destinationHtml = triple.destinationVertex().getHtml();
                if (!UiUtils.isElementFullyOnScreen(destinationHtml)) {
                    destinationHtml.centerOnScreenWithAnimation();
                }
            }
        );
    }

    function leftAction(selectedBubble) {
        var newSelectedBubble,
            isCenterVertex = selectedBubble.isConcept() && selectedBubble.isCenterVertex();
        if (isCenterVertex) {
            var centerVertex = RelativeTreeCenterVertex.usingVertex(
                selectedBubble
            );
            if (!centerVertex.hasChildToLeft()) {
                return;
            }
            newSelectedBubble = centerVertex.getToTheLeftTopMostChild();
        } else if(selectedBubble.isToTheLeft()) {
            if (!selectedBubble.hasChildren()) {
                return;
            }
            newSelectedBubble = selectedBubble.getTopMostChild();
        } else {
            newSelectedBubble = selectedBubble.getParentBubble();
        }
        if(newSelectedBubble.isConcept()){
            SelectionHandler.setToSingleVertex(newSelectedBubble);
            centerVertexIfApplicable(newSelectedBubble);
        }else{
            SelectionHandler.setToSingleGroupRelation(newSelectedBubble);
        }

    }

    function rightAction(selectedBubble) {
        var newSelectedBubble,
            isCenterVertex = selectedBubble.isConcept() && selectedBubble.isCenterVertex();
        if (isCenterVertex) {
            var centerVertex = RelativeTreeCenterVertex.usingVertex(
                selectedBubble
            );
            if (!centerVertex.hasChildToRight()) {
                return;
            }
            newSelectedBubble = centerVertex.getToTheRightTopMostChild();
        } else if (selectedBubble.isToTheLeft()) {
            newSelectedBubble = selectedBubble.getParentBubble();
        } else {
            if (!selectedBubble.hasChildren()) {
                return;
            }
            newSelectedBubble = selectedBubble.getTopMostChild();
        }
        if(newSelectedBubble.isConcept()){
            SelectionHandler.setToSingleVertex(newSelectedBubble);
            centerVertexIfApplicable(newSelectedBubble);
        }else{
            SelectionHandler.setToSingleGroupRelation(newSelectedBubble);
        }
    }

    function upAction(selectedBubble) {
        var isCenterVertex = selectedBubble.isConcept() && selectedBubble.isCenterVertex();
        if(isCenterVertex || !selectedBubble.hasBubbleAbove()){
            return;
        }
        var bubbleAbove = selectedBubble.getBubbleAbove();
        if(bubbleAbove.isConcept()){
            SelectionHandler.setToSingleVertex(bubbleAbove);
            centerVertexIfApplicable(bubbleAbove);
        }else{
            SelectionHandler.setToSingleGroupRelation(bubbleAbove);
        }

    }

    function downAction(selectedBubble) {
        var isCenterVertex = selectedBubble.isConcept() && selectedBubble.isCenterVertex();
        if(isCenterVertex || !selectedBubble.hasBubbleUnder()){
            return;
        }
        var bubbleUnder = selectedBubble.getBubbleUnder();
        if(bubbleUnder.isConcept()){
            SelectionHandler.setToSingleVertex(bubbleUnder);
            centerVertexIfApplicable(bubbleUnder);
        }else{
            SelectionHandler.setToSingleGroupRelation(bubbleUnder);
        }
    }
    function centerVertexIfApplicable(vertex){
        var html = vertex.getHtml();
        if(!UiUtils.isElementFullyOnScreen(html)){
            html.centerOnScreenWithAnimation();
        }
    }
});