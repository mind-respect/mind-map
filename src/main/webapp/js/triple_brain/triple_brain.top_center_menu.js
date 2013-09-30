/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.selection_handler"
],
    function ($, SelectionHandler) {
        var api = {};
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
            SelectionHandler.getGroupButton().on(
                "click",
                SelectionHandler.handleGroupButtonClick
            );
        };
        return api;

        function getSelectionButton() {
            return getButtons().filter(".select");
        }

        function getButtons() {
            return getTopCenterMenu().find(".buttons").find(
                "button"
            );
        }

        function getTopCenterMenu() {
            return $("#top-center-menu")
        }
    }
);
