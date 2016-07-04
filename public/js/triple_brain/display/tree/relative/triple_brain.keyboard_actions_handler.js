/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.selection_handler",
    "triple_brain.center_bubble",
    "triple_brain.vertex_service",
    "triple_brain.identification_menu",
    "triple_brain.mind_map_info",
    "triple_brain.graph_element_ui"
], function ($, EventBus, SelectionHandler, CenterBubble, VertexService, IdentificationMenu, MindMapInfo, GraphElementUi) {
    "use strict";
    var api = {},
        tabKeyNumber = 9,
        leftArrowKeyNumber = 37,
        rightArrowKeyNumber = 39,
        upArrowKeyNumber = 38,
        downArrowKeyNumber = 40,
        iArrowKeyNumber = 73,
        deleteKeyNumber = 46,
        escapeKeyNumber = 27,
        enterKeyCode = 13,
        dKeyNumber = 68,
        eKeyNumber = 69,
        sKeyNumber = 83,
        zeroKeyNumber = 48,
        rKeyNumber = 82,
        ctrlKeyNumber = 17,
        nonCtrlPlusActions = defineNonCtrlPlusKeysAndTheirActions(),
        ctrlPlusActions = defineCtrlPlusKeysAndTheirActions();
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
        var actionSet = event.ctrlKey ?
            ctrlPlusActions :
            nonCtrlPlusActions;
        var selectedElement = SelectionHandler.getSingleElement();
        var feature = actionSet[event.which];
        if(feature === undefined){
            if(event.which !== ctrlKeyNumber && !MindMapInfo.isViewOnly()){
                selectedElement.focus();
            }
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        executeFeature(feature, selectedElement);
        function isThereASpecialKeyPressed() {
            return event.altKey ||  event.metaKey;
        }
    }

    function executeFeature(feature, selectedElement){
        if(typeof feature === "string"){
            var controller = selectedElement.getController();
            if(controller[feature] === undefined){
                return;
            }
            var canDoValidator = controller[feature + "CanDo"];
            if(canDoValidator !== undefined && !canDoValidator.call(controller)){
                return;
            }
            controller[feature]();
            return;
        }
        feature(selectedElement);
    }

    function defineNonCtrlPlusKeysAndTheirActions() {
        var actions = {};
        actions[tabKeyNumber] = tabAction;
        actions[deleteKeyNumber] = deleteKeyAction;
        actions[leftArrowKeyNumber] = leftAction;
        actions[rightArrowKeyNumber] = rightAction;
        actions[upArrowKeyNumber] = upAction;
        actions[downArrowKeyNumber] = downAction;
        actions[enterKeyCode] = "addSibling";
        return actions;
    }
    function defineCtrlPlusKeysAndTheirActions() {
        var actions = {};
        actions[iArrowKeyNumber] = iAction;
        actions[eKeyNumber] = eKeyAction;
        actions[sKeyNumber] = sKeyAction;
        actions[rKeyNumber] = rKeyAction;
        actions[dKeyNumber] = "note";
        actions[zeroKeyNumber] = "center";
        return actions;
    }

    function iAction(selectedElement) {
        if (MindMapInfo.isViewOnly() || selectedElement.isGroupRelation()) {
            return;
        }
        selectedElement.getController().identify();
    }

    function eKeyAction(selectedElement) {
        if (!selectedElement.isInTypes([
                GraphElementUi.Types.GroupRelation,
                GraphElementUi.Types.Vertex
            ])) {
            return;
        }
        if (selectedElement.hasHiddenRelationsContainer()) {
            selectedElement.addChildTree().done(function(){
                selectedElement.centerOnScreenWithAnimation();
            });
        }
    }

    function sKeyAction(selectedElement) {
        if (!selectedElement.isVertex()) {
            return;
        }
        var handler = selectedElement.getController();
        if (handler.suggestionsCanDo(selectedElement)) {
            handler.suggestions(
                selectedElement
            );
        }
    }

    function rKeyAction(selectedElement) {
        if (!selectedElement.isRelation()) {
            return;
        }
        selectedElement.getController().reverse();
    }

    function tabAction(selectedElement) {
        if (MindMapInfo.isViewOnly() || selectedElement.isProperty()) {
            return;
        }
        selectedElement.getController().addChild();
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

    function selectNew(newSelectedElement) {
        SelectionHandler.setToSingleGraphElement(newSelectedElement);
    }

    function deleteKeyAction(selectedElement) {
        if (MindMapInfo.isViewOnly()) {
            return;
        }
        selectedElement.getController().remove();
    }
});