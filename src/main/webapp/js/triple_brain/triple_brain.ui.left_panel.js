/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.event_bus",
        "triple_brain.mind_map_info"
    ],
    function ($, EventBus, MindMapInfo) {
        "use strict";
        var api = {},
            _leftPanel;
        api.init = function () {
            getToggleCollapseButton().on(
                "click",
                collapseButtonClickHandler
            );
            function collapseButtonClickHandler() {
                var button = $(this),
                    leftPanel = getLeftPanel();
                if (leftPanel.hasClass("collapsed")) {
                    expand();
                    button.animate({
                        left: '235px'
                    }).text("<<");
                } else {
                    collapse();
                    button.animate({
                        left: '10px'
                    }).text(">>");
                }
                function collapse() {
                    leftPanel.animate({
                        width: "0"
                    }).addClass("collapsed");
                }

                function expand() {
                    leftPanel.animate({
                        width: "225px"
                    }).removeClass("collapsed");
                }
            }
        };
        api.addHtml = function (html) {
            getLeftPanel().append(html);
        };
        EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function(){
            if(!MindMapInfo.isCenterBubbleUriDefinedInUrl()){
                getLeftPanel().addClass("hidden");
                getToggleCollapseButton().addClass("hidden");
            }
        });
        return api;
        function getLeftPanel() {
            if (!_leftPanel) {
                _leftPanel = $("#left-panel");
            }
            return _leftPanel;
        }
        function getToggleCollapseButton() {
            return $("#toggle-left-panel-collapse");
        }
    }
);