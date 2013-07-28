/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "jquery.colorbox"
],
    function () {
        var api = {};
        api.showLinearFlowWithOptions = function (configuration) {
            var options = $.extend({
                width:300,
                closeOnEscape:false,
                modal:true,
                draggable:false
            }, configuration);
            $("#mind_map").load(
                configuration.href,
                function(){
                    configuration.onComplete();
                    $("#mind_map").dialog(options);
                    hideCloseButton();
                }
            );
//            $(".ui-dialog")
//                .css("position", "fixed")
//                .css("left", "40%")
//                .css("top", "0");
            hideCloseButton();
        };
        api.close = function () {
            $.colorbox.close();
        }
        api.adjustSize = function () {
            $.colorbox.resize();
        }
        return api;
        function hideCloseButton() {
            $(".ui-dialog-titlebar-close").hide()
        }
    }
)