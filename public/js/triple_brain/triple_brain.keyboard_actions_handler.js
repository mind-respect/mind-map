/*
* Copyright Vincent Blouin under the GPL License version 3
*/

define([
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.selection_handler",
    "triple_brain.mind_map_info",
    "triple_brain.ui_utils",
    "triple_brain.graph_displayer"
], function ($, EventBus, SelectionHandler, MindMapInfo, UiUtils, GraphDisplayer) {
    "use strict";

    var api = {},
        tabKeyNumber = 9,
        leftArrowKeyNumber = 37,
        rightArrowKeyNumber = 39,
        upArrowKeyNumber = 38,
        downArrowKeyNumber = 40,
        gArrowKeyNumber = 71,
        deleteKeyNumber = 46,
        backspaceKeyNumber = 8,
        escapeKeyNumber = 27,
        spacebarKeyNumber = 32,
        enterKeyCode = 13,
        aKeyNumber = 65,
        dKeyNumber = 68,
        eKeyNumber = 69,
        fKeyNumber = 70,
        hKeyNumber = 72,
        iKeyNumber = 73,
        pKeyNumber = 80,
        sKeyNumber = 83,
        zeroKeyNumber = 48,
        xKeyNumber = 88,
        vKeyNumber = 86,
        yKeyNumber = 89,
        zKeyNumber = 90,
        oKeyNumber = 79,
        mKeyNumber = 77,
        plusKeyNumber = 107,
        minusKeyNumber = 109,
        plusKeyNumberMac = 187,
        minusKeyNumberMac = 189,
        bKeyNumber = 66,
        lKeyNumber = 76,
        nonCtrlPlusActions = defineNonCtrlPlusKeysAndTheirActions(),
        ctrlPlusActions = defineCtrlPlusKeysAndTheirActions();

    api._ctrlKeyNumber = UiUtils.isMacintosh() ? 91 : 17;

    api.disable = function () {
        $(window).off(
            "keydown", keyDownHandler
        ).off(
            "paste", pasteHandler
        );
    };

    api.enable = function () {
        api.disable();
        $(window).on(
            "keydown", keyDownHandler
        ).on(
            'paste', pasteHandler
        );
    };

    api.init = function () {
        $(window).bind('mousewheel DOMMouseScroll', function (event) {
            if (event.which !== api._ctrlKeyNumber) {
                event.preventDefault();
            }
        });
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
        }, oEvent);
    }

    function keyDownHandler(event) {
        // console.log(event.which);
        var target = $(event.target),
            isWorkingOnSomething = !target.is("body") && !target.is("button") && !target.is("a");
        var isCombineKeyPressed = UiUtils.isMacintosh() ? event.metaKey : event.ctrlKey;
        if (isWorkingOnSomething) {
            if (event.keyCode === escapeKeyNumber) {
                target.blur();
            }
            return;
        }
        if (isThereASpecialKeyPressed()) {
            return;
        }
        var actionSet = isCombineKeyPressed ?
            ctrlPlusActions :
            nonCtrlPlusActions;
        var feature = actionSet[event.which];
        if (feature === undefined) {
            var isPasting = isCombineKeyPressed && vKeyNumber && event.which;
            if (!isPasting && event.which !== api._ctrlKeyNumber && !MindMapInfo.isViewOnly() && SelectionHandler.isOnlyASingleElementSelected()) {
                var selectedElement = SelectionHandler.getSingleElement();
                if (selectedElement.isLabelEditable()) {
                    selectedElement.focus();
                }
            }
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (!Array.isArray(feature)) {
            feature = [feature];
        }
        feature.forEach(function (feature) {
            executeFeature(feature);
        });

        function isThereASpecialKeyPressed() {
            return event.altKey || (event.metaKey && !UiUtils.isMacintosh()) || (event.ctrlKey && UiUtils.isMacintosh());
        }
    }

    function executeFeature(feature, event) {
        var controller;
        if (feature.isForAppController) {
            controller = GraphDisplayer.getAppController();
        } else {
            controller = SelectionHandler.getControllerFromCurrentSelection();
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
        actions[backspaceKeyNumber] = {
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
        actions[escapeKeyNumber] = {
            action: "deselect"
        };
        actions[spacebarKeyNumber] = {
            action: "focus"
        };
        return actions;
    }

    function defineCtrlPlusKeysAndTheirActions() {
        var actions = {};
        actions[gArrowKeyNumber] = [{
            action: "identify"
        }, {
            action: "identifyWhenMany"
        }];
        actions[aKeyNumber] = {
            action: "selectTree"
        };
        actions[eKeyNumber] = {
            action: "expand"
        };
        actions[sKeyNumber] = {
            action: "suggestions"
        };
        actions[iKeyNumber] = {
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
        actions[pKeyNumber] = {
            action: "togglePublicPrivate"
        };
        actions[oKeyNumber] = [{
            action: "convertToRelation"
        }, {
            action: "convertToGroupRelation"
        }];
        actions[plusKeyNumber] = {
            action: "zoomIn",
            isForAppController: true
        };
        actions[plusKeyNumberMac] = {
            action: "zoomIn",
            isForAppController: true
        };
        actions[minusKeyNumber] = {
            action: "zoomOut",
            isForAppController: true
        };
        actions[minusKeyNumberMac] = {
            action: "zoomOut",
            isForAppController: true
        };
        actions[upArrowKeyNumber] = {
            action: "moveUp"
        };
        actions[downArrowKeyNumber] = {
            action: "moveDown"
        };
        actions[mKeyNumber] = {
            action: "merge"
        };
        actions[fKeyNumber] = {
            action: "find",
            isForAppController: true
        };
        actions[bKeyNumber] = {
            action: "createVertex",
            isForAppController: true
        };
        actions[lKeyNumber] = {
            action: "list"
        };
        return actions;
    }
});
