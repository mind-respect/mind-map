/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
],
    function ($) {
        "use strict";
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
            getOtherPageContainer().removeClass("hidden").load(
                configuration.href,
                function(){
                    if(configuration.onComplete !== undefined){
                        configuration.onComplete();
                    }
                    getOtherPageContainer().dialog(options).i18n();
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
            ).addClass("hidden");
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
);