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
    "triple_brain.ui.edge"
], function ($, EventBus, RelativeTreeCenterVertex, SelectionHandler, VertexService, RelativeTreeVertex, EdgeUi) {
    var api = {},
        tabKeyNumber = 9,
        leftArrowKeyNumber = 37,
        rightArrowKeyNumber = 39,
        upArrowKeyNumber = 38,
        downArrowKeyNumber = 38;
    api.init = function () {
        EventBus.subscribe(
            "/event/ui/app/started",
            handleKeyboardActions
        );
    };
    return api;
    function handleKeyboardActions() {
        var listenedKeysAndTheirAction = defineListenedKeysAndTheirActions();
        $(window).keydown(function (event) {
            if (isThereASpecialKeyPressed()) {
                return;
            }
            if (!SelectionHandler.isOnlyASingleBubbleSelected()) {
                return;
            }
            $.each(listenedKeysAndTheirAction, function () {
                var key = this[0];
                if (event.which !== key) {
                    return;
                }
                event.preventDefault();
                var action = this[1];
                var selectedVertex = SelectionHandler.getSelectedBubbles()[0];
                action(selectedVertex);
                return false;
            });
            function isThereASpecialKeyPressed() {
                return event.altKey || event.ctrlKey || event.metaKey;
            }
        });
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
            selectedVertex, EdgeUi.redrawAllEdges
        );
    }

    function leftAction(selectedVertex) {
        if (selectedVertex.isCenterVertex()) {
            var centerVertex = RelativeTreeCenterVertex.usingVertex(
                selectedVertex
            );
            if (!centerVertex.hasChildToLeft()) {
                return;
            }
            selectedVertex.deselect();
            RelativeTreeVertex.withHtml(
                centerVertex.getTopMostChildToLeftHtml()
            ).select();
        } else if(selectedVertex.isToTheLeft()) {
            if (!selectedVertex.hasChildren()) {
                return;
            }
            selectedVertex.deselect();
            selectedVertex.getTopMostChild().select();
        } else {
            selectedVertex.deselect();
            selectedVertex.getParentVertex().select();
        }
        SelectionHandler.refreshSelectionMenu();
    }

    function rightAction(selectedVertex) {
        if (selectedVertex.isCenterVertex()) {
            var centerVertex = RelativeTreeCenterVertex.usingVertex(
                selectedVertex
            );
            if (!centerVertex.hasChildToRight()) {
                return;
            }
            selectedVertex.deselect();
            RelativeTreeVertex.withHtml(
                centerVertex.getTopMostChildToRightHtml()
            ).select();
        } else if (selectedVertex.isToTheLeft()) {
            selectedVertex.deselect();
            selectedVertex.getParentVertex().select();
        } else {
            if (!selectedVertex.hasChildren()) {
                return;
            }
            selectedVertex.deselect();
            selectedVertex.getTopMostChild().select();
        }
        SelectionHandler.refreshSelectionMenu();
    }

    function upAction(selectedVertex) {

    }

    function downAction(selectedVertex) {

    }

});