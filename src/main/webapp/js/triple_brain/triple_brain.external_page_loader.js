/*
 * Copyright Vincent Blouin under the GPL License version 3
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
                }
            );
        };
        return api;
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