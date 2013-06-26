/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.utils"
], function ($, UiUtils) {
        var api = {};
        api.peripheralMenuForMenuHtmlAndVertex = function (html, vertex) {
            return new PeripheralMenu(
                $(html),
                vertex
            );
        };
        return api;

        function PeripheralMenu(html, vertex) {
            var self = this;
            this.init = function () {
                html.prepend(
                    "<span class='close_button'>&#10006;" +
                        "</span>"
                );
                html.find(".close_button").on("click", function () {
                    $(this).closest(".peripheral-menu").remove();
                });
                self.position();
                html.centerOnScreen();
                return self;
            };
            this.position = function(){
                UiUtils.positionRight(
                    html,
                    vertex.getHtml()
                );
            };
        }
    }
);