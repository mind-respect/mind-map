/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
],
    function () {
        var api = {};
        api.showLinearFlowWithOptions = function (configuration) {
            var options = $.extend({
                width:300,
                closeOnEscape:false,
                modal:true,
                draggable:false,
                resizable:false
            }, configuration);
            if(isThereCurrentlyADialog()){
                removeCurrentDialog();
            }
            getOtherPageContainer().show().load(
                configuration.href,
                function(){
                    configuration.onComplete();
                    getOtherPageContainer().dialog(options);
                    hideCloseButton();
                }
            );
            getMindMapContainer().hide();
            hideCloseButton();
        };
        return api;
        function hideCloseButton() {
            $(
                ".ui-dialog-titlebar-close"
            ).hide();
        }
        function getMindMapContainer(){
            return $("#mind_map");
        }
        function isThereCurrentlyADialog(){
            return getOtherPageContainer().hasClass(
                "ui-dialog-content"
            );
        }
        function getOtherPageContainer(){
            return $("#other-page-container");
        }
        function removeCurrentDialog(){
            $("#other-page-container").dialog("destroy");
        }
    }
)