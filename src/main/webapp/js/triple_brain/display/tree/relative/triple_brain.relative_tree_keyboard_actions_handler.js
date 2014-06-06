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
        var selectedVertex = SelectionHandler.getSelectedBubbles()[0];
        $.each(listenedKeysAndTheirAction, function () {
            var key = this[0];
            if (event.which !== key) {
                return;
            }
            event.preventDefault();
            var action = this[1];
            action(selectedVertex);
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
                EdgeUi.redrawAllEdges();
                var destinationHtml = triple.destinationVertex().getHtml();
                if (!UiUtils.isElementFullyOnScreen(destinationHtml)) {
                    destinationHtml.centerOnScreenWithAnimation();
                }
            }
        );
    }

    function leftAction(selectedVertex) {
        var newSelectedVertex;
        if (selectedVertex.isCenterVertex()) {
            var centerVertex = RelativeTreeCenterVertex.usingVertex(
                selectedVertex
            );
            if (!centerVertex.hasChildToLeft()) {
                return;
            }
            newSelectedVertex = RelativeTreeVertex.withHtml(
                centerVertex.getTopMostChildToLeftHtml()
            );
        } else if(selectedVertex.isToTheLeft()) {
            if (!selectedVertex.hasChildren()) {
                return;
            }
            newSelectedVertex = selectedVertex.getTopMostChild();
        } else {
            newSelectedVertex = selectedVertex.getParentVertex();
        }
        SelectionHandler.setToSingleBubble(newSelectedVertex);
        centerVertexIfApplicable(newSelectedVertex);
    }

    function rightAction(selectedVertex) {
        var newSelectedVertex;
        if (selectedVertex.isCenterVertex()) {
            var centerVertex = RelativeTreeCenterVertex.usingVertex(
                selectedVertex
            );
            if (!centerVertex.hasChildToRight()) {
                return;
            }
            newSelectedVertex = RelativeTreeVertex.withHtml(
                centerVertex.getTopMostChildToRightHtml()
            );
        } else if (selectedVertex.isToTheLeft()) {
            newSelectedVertex = selectedVertex.getParentVertex();
        } else {
            if (!selectedVertex.hasChildren()) {
                return;
            }
            newSelectedVertex = selectedVertex.getTopMostChild();
        }
        SelectionHandler.setToSingleBubble(newSelectedVertex);
        centerVertexIfApplicable(newSelectedVertex);
    }

    function upAction(selectedVertex) {
        if(selectedVertex.isCenterVertex() || !selectedVertex.hasBubbleAbove()){
            return;
        }
        var bubbleAbove = selectedVertex.getBubbleAbove();
        SelectionHandler.setToSingleBubble(bubbleAbove)
        centerVertexIfApplicable(bubbleAbove);
    }

    function downAction(selectedVertex) {
        if(selectedVertex.isCenterVertex() || !selectedVertex.hasBubbleUnder()){
            return;
        }
        var bubbleUnder = selectedVertex.getBubbleUnder();
        SelectionHandler.setToSingleBubble(bubbleUnder);
        centerVertexIfApplicable(bubbleUnder);
    }
    function centerVertexIfApplicable(vertex){
        var html = vertex.getHtml();
        if(!UiUtils.isElementFullyOnScreen(html)){
            html.centerOnScreenWithAnimation();
        }
    }
});