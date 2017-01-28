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
    "triple_brain.graph_ui",
    "mr.app_controller"
], function ($, EventBus, SelectionHandler, CenterBubble, VertexService, IdentificationMenu, MindMapInfo, GraphUi, AppController) {
    "use strict";
    var api = {},
        tabKeyNumber = 9,
        spaceBarKeyNumber = 32,
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
        hKeyNumber = 72,
        sKeyNumber = 83,
        zeroKeyNumber = 48,
        rKeyNumber = 82,
        ctrlKeyNumber = 17,
        xKeyNumber = 88,
        vKeyNumber = 86,
        yKeyNumber = 89,
        zKeyNumber = 90,
        nonCtrlPlusActions = defineNonCtrlPlusKeysAndTheirActions(),
        ctrlPlusActions = defineCtrlPlusKeysAndTheirActions();

    api.disable = function(){
        $(window).off(
            "keydown", keyDownHandler
        ).off(
            "paste", pasteHandler
        );
    };

    api.enable = function(){
        api.disable();
        $(window).on(
            "keydown", keyDownHandler
        ).on(
            'paste', pasteHandler
        );
    };

    api.init = function () {
        EventBus.subscribe(
            "/event/ui/graph/drawing_info/updated/",
            api._handleKeyboardActions
        );
    };
    api._handleKeyboardActions = function () {
        api.enable();
    };
    return api;

    function pasteHandler(event) {
        if (!SelectionHandler.isOnlyASingleElementSelected()) {
            return;
        }
        var selectedElement = SelectionHandler.getSingleElement();
        if (selectedElement.isInEditMode()) {
            return;
        }
        var oEvent = event.originalEvent;
        event.preventDefault();
        executeFeature({
            action: "paste"
        }, selectedElement, oEvent);
    }

    function keyDownHandler(event) {
        // console.log(event.which);
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
        var actionSet = event.ctrlKey ?
            ctrlPlusActions :
            nonCtrlPlusActions;
        var feature = actionSet[event.which];
        if (feature === undefined) {
            var isPasting = event.ctrlKey && vKeyNumber && event.which;
            if (!isPasting && event.which !== ctrlKeyNumber && !MindMapInfo.isViewOnly() && SelectionHandler.isOnlyASingleElementSelected()) {
                SelectionHandler.getSingleElement().focus();
            }
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        executeFeature(feature);
        function isThereASpecialKeyPressed() {
            return event.altKey || event.metaKey;
        }
    }

    function executeFeature(feature, event) {
        var controller;
        if (feature.isForAppController) {
            controller = AppController;
        } else {
            if (!SelectionHandler.isOnlyASingleElementSelected()) {
                return;
            }
            controller = SelectionHandler.getSingleElement().getController();
        }
        if (controller[feature.action] === undefined) {
            return;
        }
        var canDoValidator = controller[feature.action + "CanDo"];
        if (canDoValidator !== undefined && !canDoValidator.call(controller)) {
            return;
        }
        controller[feature.action](event);
    }

    function defineNonCtrlPlusKeysAndTheirActions() {
        var actions = {};
        actions[tabKeyNumber] = {
            action: "addChild"
        };
        actions[deleteKeyNumber] = {
            action: "remove"
        };
        actions[leftArrowKeyNumber] = {
            action: "travelLeft"
        };
        actions[rightArrowKeyNumber] = {
            action: "travelRight"
        };
        actions[upArrowKeyNumber] = {
            action: "travelUp"
        };
        actions[downArrowKeyNumber] = {
            action: "travelDown"
        };
        actions[enterKeyCode] = {
            action: "addSibling"
        };
        actions[spaceBarKeyNumber] = {
            action: "focus"
        };
        return actions;
    }

    function defineCtrlPlusKeysAndTheirActions() {
        var actions = {};
        actions[iArrowKeyNumber] = {
            action: "identify"
        };
        actions[eKeyNumber] = {
            action: "expand"
        };
        actions[sKeyNumber] = {
            action: "suggestions"
        };
        actions[rKeyNumber] = {
            action: "reverse"
        };
        actions[dKeyNumber] = {
            action: "note"
        };
        actions[zeroKeyNumber] = {
            action: "center"
        };
        actions[hKeyNumber] = {
            action: "collapse"
        };
        actions[xKeyNumber] = {
            action: "cut"
        };
        actions[yKeyNumber] = {
            action: "redo",
            isForAppController: true
        };
        actions[zKeyNumber] = {
            action: "undo",
            isForAppController: true
        };
        return actions;
    }
});