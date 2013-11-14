/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
],
    function ($) {
        var api = {};
        api.init = function () {
            getToggleCollapseButton().on(
                "click",
                function () {
                    var button = $(this);
                    if (getLeftPanel().hasClass("collapsed")) {
                        expand();
                        button.animate({
                            left:'235px'
                        }).text("<<");
                    } else {
                        collapse();
                        button.animate({
                            left:'10px'
                        }).text(">>");
                    }
                });
            function collapse() {
                getLeftPanel().animate({
                    width:"0"
                }).addClass("collapsed");
            }

            function expand() {
                getLeftPanel().animate({
                    width:"225px"
                }).removeClass("collapsed");
            }
        };
        api.addHtml = function (html) {
            getLeftPanel().append(html);
        };
        return api;

        function getLeftPanel() {
            return $("#left-panel");
        }

        function getToggleCollapseButton() {
            return $("#toggle-left-panel-collapse");
        }
    }
);