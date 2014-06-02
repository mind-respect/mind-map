/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.selection_handler"
],
    function ($, SelectionHandler) {
        "use strict";
        var api = {},
            topCenterMenu,
            buttons,
            selectionButton;
        api.init = function () {
            getButtons().button();
            getSelectionButton().on(
                "click",
                SelectionHandler.handleButtonClick
            );
            SelectionHandler.getSelectionManagementButton().on(
                "click",
                SelectionHandler.handleSelectionManagementClick
            );
        };
        return api;
        function getSelectionButton() {
            if(!selectionButton){
                selectionButton = getButtons().filter(".select");
            }
            return selectionButton;
        }

        function getButtons() {
            if(!buttons){
                buttons = getTopCenterMenu().find(".buttons").find(
                    "button"
                );
            }
            return buttons;
        }

        function getTopCenterMenu() {
            if(!topCenterMenu){
                topCenterMenu = $("#top-center-menu");
            }
            return topCenterMenu;
        }
    }
);
