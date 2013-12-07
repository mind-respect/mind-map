/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
], function($){
    var api = {};
    api.isCtrlPressed = function(){
        return $("body").data(
            "isSettingCtrl"
        );
    };
    initIfApplicable();
    $(document).keydown(function(event){
        if(event.ctrlKey){
            setIsPressingCtrl(true);
        }
    });
    $(document).keyup(function(event){
        if(event.ctrlKey){
            setIsPressingCtrl(false);
        }
    });
    return api;
    function initIfApplicable(){
        if(api.isCtrlPressed() === undefined){
            setIsPressingCtrl(false);
        }
    }
    function setIsPressingCtrl(isSettingCtrl){
        $("body").data(
            "isSettingCtrl", isSettingCtrl
        );
    }
});